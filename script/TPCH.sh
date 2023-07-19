1. download https://github.com/tvondra/pg_tpch.
2. download the TPC-H benchmark from http://tpc.org/tpch/default.asp
3. copy pg_tpch/* tpch/dbgen/
4. cp makefile.suite Makefile
5. vi Makefile
and modify it so that it contains this (around line 110)

CC=gcc
DATABASE=ORACLE  —> this should be ORACLE only
MACHINE=LINUX
WORKLOAD=TPCH
6. ./dbgen -s 10
7. and to convert them to a CSV format compatible with PostgreSQL, do this
$ for i in `ls *.tbl`; do sed 's/|$//' $i > ${i/tbl/csv}; echo $i; done;
8. mkdir dss/queries  mkdir dss/data
9. 
10. ln -s /home/dilip/tpch/dbgen/…dss/data/ /tmp/dss-data
11. 
for q in `seq 1 22`
do
    DSS_QUERY=dss/templates ./qgen $q >> dss/queries/$q.sql
    sed 's/^select/explain select/' dss/queries/$q.sql > dss/queries/$q.explain.sql
    cat dss/queries/$q.sql >> dss/queries/$q.explain.sql;
done

12.
psql -f dss/tpch-load.sql  POSTGRES
psql -f dss/tpch-pkeys.sql POSTGRES
psql -f dss/tpch-alter.sql POSTGRES
psql -f dss/tpch-index.sql POSTGRES

analyze


##############


TPC-H PostgreSQL benchmark
First, download the TPC-H benchmark from http://tpc.org/tpch/default.asp and extract it to a directory

$ wget http://tpc.org/tpch/spec/tpch_2_14_3.tgz
$ mkdir tpch
$ tar -xzf tpch_2_14_3.tgz -C tpch

and then prepare the Makefile - create a copy from makefile.suite

$ cd tpch/dbgen
$ cp makefile.suite Makefile
$ vi Makefile

and modify it so that it contains this (around line 110)

CC=gcc
DATABASE=ORACLE
MACHINE=LINUX
WORKLOAD=TPCH

and compile it using make as usual. Now you should have dbgen and qgen tools that generate data and queries.
Generating data
$ ./dbgen -s 10
$ ls *.tbl

and to convert them to a CSV format compatible with PostgreSQL, do this
$ for i in `ls *.tbl`; do sed 's/|$//' $i > ${i/tbl/csv}; echo $i; done;

Finally, move these data to the 'dss/data' directory or somewhere else, and create a symlink to /tmp/dss-data (that's where tpch-load.sql is looking for for the data from).

for q in `seq 1 22`
do
    DSS_QUERY=dss/templates ./qgen $q >> dss/queries/$q.sql
    sed 's/^select/explain select/' dss/queries/$q.sql > dss/queries/$q.explain.sql
    cat dss/queries/$q.sql >> dss/queries/$q.explain.sql;
done

Now you should have 44 files in the dss/queries directory. 22 of them will actually run the queries and the other 22 will generate EXPLAIN plan of the query (without actually running it).
Running the benchmark

$ ./tpch.sh ./results tpch-db tpch-user

and wait until the benchmark.
Processing the results

$ php process.php ./results output.csv

This should give you nicely formatted CSV file.

    Contact GitHub
    API
    Training
    Shop
    Blog
    About

    © 2016 GitHub, Inc.
    Terms
    Privacy
    Security
    Status
    Help

