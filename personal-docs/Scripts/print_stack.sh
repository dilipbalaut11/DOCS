
#ps -ef | grep "postgres:" | cut -d ' ' -f6 > file_pid.txt
#ps -ef | grep "postgres:" | cut -d ' ' -f5 >> file_pid.txt

ps -ef | grep "postgres"|grep -v "grep" | awk '{print $2}' > file_pid.txt

while read LINE
do
	pid[$i]=$LINE
	echo $pid[$i]
	i=$i+1
	echo $LINE

done <file_pid.txt

while true
do	
for j in ${pid[@]}; 
do 
	echo $j
	tmp=file_cmd
	echo thread apply all bt >"$tmp"
	gdb -batch -nx -q -x "$tmp" -p $j>> trace_$j.txt
	rm -f "$tmp"
done
sleep 10
done
