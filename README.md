# prisma-typeorm-practise
prisma vs typeorm and practise

# setup
```shell
git https://github.com/DragonLiParadise/prisma-typeorm-practise.git
cd prisma-typeorm-practise
./build.sh
```

> You can customize the corresponding parameters in `build.sh`

> Tip: make sure that docker and docker-compose are installed before operation. For specific installation methods, please refer to the official website.

> If you want to install it manually, you can execute it manually by following the command in `build.sh`.

## Make changes to master
> docker exec mysql_master sh -c "export MYSQL_PWD=123456; mysql -u root mydb -e 'create table code(code int); insert into code values (100), (200)'"

## Read changes from slave
> docker exec mysql_slave sh -c "export MYSQL_PWD=123456; mysql -u root mydb -e 'select * from code \G'"

# Troubleshooting
## Check Logs
```shell
docker-compose logs
```
## Start containers in "normal" mode
> Go through "build.sh" and run command step-by-step.

## Check running containers
```shell
docker-compose ps
```
## Clean data dir
```shell
rm -rf ./cluster/master/data/*
rm -rf ./cluster/slave/data/*
```

## Run command inside "mysql_master"
> docker exec mysql_master sh -c 'mysql -u root -p111 -e "SHOW MASTER STATUS \G"'
## Run command inside "mysql_slave"
> docker exec mysql_slave sh -c 'mysql -u root -p111 -e "SHOW SLAVE STATUS \G"'
## Enter into "mysql_master"
> docker exec -it mysql_master bash
## Enter into "mysql_slave"
> docker exec -it mysql_slave bash