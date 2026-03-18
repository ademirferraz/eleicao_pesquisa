@echo off
echo Gerando 100 eleitores de teste...

powershell -Command ^
"$url='http://localhost:5173'; ^
Start-Process $url; ^
Start-Sleep -Seconds 3; ^
$wshell = New-Object -ComObject wscript.shell; ^
$wshell.SendKeys '{F12}'; ^
Start-Sleep -Seconds 2; ^
$codigo = @'
let votos=[];
let candidatos=[10,20,30,40,50,60,70,80,90];
for(let i=0;i<100;i++){
  let num=candidatos[Math.floor(Math.random()*candidatos.length)];
  votos.push({numero:num,data:new Date().toISOString()});
}
localStorage.setItem(\"votes\",JSON.stringify(votos));
location.reload();
'@; ^
Set-Clipboard $codigo; ^
$wshell.SendKeys '^v'; ^
Start-Sleep -Milliseconds 500; ^
$wshell.SendKeys '{ENTER}';"

echo Pronto!
pause
