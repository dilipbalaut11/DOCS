
#ps -ef | grep "postgres:" | cut -d ' ' -f6 > file_pid.txt
#ps -ef | grep "postgres:" | cut -d ' ' -f5 >> file_pid.txt
cmd='perf record -g'
cmd1='-p'
ps -ef | grep "postgres:" |grep -v "grep"| awk '{print $2}' > file_pid.txt
while read LINE
do
	pid[$i]=$LINE
	echo $pid[$i]
	i=$i+1
	echo $LINE
done <file_pid.txt


for j in ${pid[@]}; 
do 
 echo $j
 cmd=$cmd" -p "$j
 echo $cmd
done

echo $cmd
$cmd
