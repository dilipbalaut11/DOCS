ulimit -c unlimited

pkill -9 postgres
rm -rf data data1 data2
./initdb -D data
echo "wal_level = logical" >> data/postgresql.conf
echo "port = 5432" >> data/postgresql.conf
echo "logical_decoding_work_mem=64kB" >> data/postgresql.conf
echo "max_wal_size=10GB" >> data/postgresql.conf

./pg_ctl -D data -c start

./initdb -D data1
echo "wal_level = logical" >> data1/postgresql.conf
echo "port = 5433" >> data1/postgresql.conf
#echo "logical_decoding_work_mem=64kB" >> data1/postgresql.conf
echo "max_wal_size=10GB" >> data1/postgresql.conf
./pg_ctl -D data1 -c start
