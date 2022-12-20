#!/bin/bash
#################### Variable definition ####################
mysql_user="mydb_slave_user"    # The user name that the primary server allows login from the server
mysql_password="mydb_slave_pwd" # The password for the primary server to allow login from the server
root_password="123456"             # Root password for each server
# List of main libraries
master_container=mysql_master
# From the list of libraries
slave_containers=(mysql_slave mysql_slave2)
# List of all database clusters
all_containers=("$master_container" "${slave_containers[@]}")

# Link retry interval s
retry_duration=5

#################### Function definition ####################
# Get the server's ip
docker-ip() {
    docker inspect --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$@"
}

#################### docker-compose init ####################
docker-compose down
rm -rf ./cluster/master/data/* ./cluster/slave/data/* ./cluster/slave2/data/*
docker-compose build
docker-compose up -d

#################### Server initialization operation ####################
# The purpose of this operation is to try to connect to the server. If the connection fails, wait 4 seconds and try again until the mysql server is ready and connected.
for container in "${all_containers[@]}";do
  until docker exec $container sh -c 'export MYSQL_PWD='$root_password'; mysql -u root -e ";"'
  do
      echo "waiting $container Connecting, please wait a moment,Try to connect every ${retry_duration} s and may retry several times until the container is started."
      sleep $retry_duration
  done
done

#################### 主服务器操作 ####################开始
# 在主服务器上添加数据库用户
priv_stmt='GRANT REPLICATION SLAVE ON *.* TO "'$mysql_user'"@"%" IDENTIFIED BY "'$mysql_password'"; FLUSH PRIVILEGES;'

docker exec $master_container sh -c "export MYSQL_PWD='$root_password'; mysql -u root -e '$priv_stmt'"

# 查看主服务器的状态
MS_STATUS=`docker exec $master_container sh -c 'export MYSQL_PWD='$root_password'; mysql -u root -e "SHOW MASTER STATUS"'`

# binlog文件名字,对应 File 字段,值如: mysql-bin.000004
CURRENT_LOG=`echo $MS_STATUS | awk '{print $6}'`
# binlog位置,对应 Position 字段,值如: 1429
CURRENT_POS=`echo $MS_STATUS | awk '{print $7}'`

#################### 从服务器操作 ####################开始
# 设置从服务器与主服务器互通命令
start_slave_stmt="CHANGE MASTER TO
        MASTER_HOST='$(docker-ip $master_container)',
        MASTER_USER='$mysql_user',
        MASTER_PASSWORD='$mysql_password',
        MASTER_LOG_FILE='$CURRENT_LOG',
        MASTER_LOG_POS=$CURRENT_POS;"
start_slave_cmd='export MYSQL_PWD='$root_password'; mysql -u root -e "'
start_slave_cmd+="$start_slave_stmt"
start_slave_cmd+='START SLAVE;"'

# 执行从服务器与主服务器互通
for slave in "${slave_containers[@]}";do
  # 从服务器连接主互通
  docker exec $slave sh -c "$start_slave_cmd"
  # 查看从服务器得状态
  docker exec $slave sh -c "export MYSQL_PWD='$root_password'; mysql -u root -e 'SHOW SLAVE STATUS \G'"
done

echo -e "\033[42;34m finish success !!! \033[0m"
