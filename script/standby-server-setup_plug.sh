#!/bin/bash
echo "Cleaning.."
pkill -9 postgres
rm -rf *_logfile
rm /tmp/failover.log
rm -rf /tmp/archive_dir
mkdir /tmp/archive_dir

export PGPORT=5432			#MASTER PORT
PGSQL_DIR=$(pwd)
PGSQL_BIN=$PGSQL_DIR/bin
PGSQL_MASTER=$PGSQL_DIR/bin/master		#DATA FOLDER FOR PRIMARY/MASTER SERVER
PGSQL_STANDBY=$PGSQL_DIR/bin/standby	#DATA FOLDER FOR BACKUP/STANDBY SERVER
/Users/dilipkumar/Documents/Virtual Machines.localized/CentOS 64-bit_1.vmwarevm
#Cleanup the master and slave data directory and create a new one.
rm -rf $PGSQL_MASTER $PGSQL_STANDBY
mkdir $PGSQL_MASTER $PGSQL_STANDBY
chmod 700 $PGSQL_MASTER
chmod 700 $PGSQL_STANDBY

#Initialize MASTER
$PGSQL_BIN/initdb -D $PGSQL_MASTER
#echo "wal_level = hot_standby" >> $PGSQL_MASTER/postgresql.conf
#echo "max_wal_senders = 3" >> $PGSQL_MASTER/postgresql.conf
#echo "wal_keep_segments = 10" >> $PGSQL_MASTER/postgresql.conf
#echo "hot_standby = on" >> $PGSQL_MASTER/postgresql.conf
#echo "max_standby_streaming_delay= -1" >> $PGSQL_MASTER/postgresql.conf
#echo "wal_consistency_checking='all'" >> $PGSQL_MASTER/postgresql.conf
echo "autovacuum=off" >> $PGSQL_MASTER/postgresql.conf
echo "max_wal_size=5GB" >> $PGSQL_MASTER/postgresql.conf
#echo "log_min_messages=debug1" >> $PGSQL_MASTER/postgresql.conf
#echo "disable_tpd = true" >> $PGSQL_MASTER/postgresql.conf

#Setup replication settings

#Start Master
export PGPORT=5432
echo "Starting Master.."
$PGSQL_BIN/pg_ctl -D $PGSQL_MASTER -c -w -l master_logfile start

#Perform Backup in the Standy Server
$PGSQL_BIN/pg_basebackup --pgdata=$PGSQL_STANDBY -P
echo "primary_conninfo= 'port=5432'" >> $PGSQL_STANDBY/postgresql.conf
touch $PGSQL_STANDBY/standby.signal
#echo "standby_mode = on" >> $PGSQL_STANDBY/postgresql.conf
#Start STANDBY
export PGPORT=5433
echo "Starting Slave.."
$PGSQL_BIN/pg_ctl -D $PGSQL_STANDBY -c -w -l slave_logfile start


