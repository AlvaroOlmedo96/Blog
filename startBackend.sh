#!/bin/bash

echo "****Deteniendo backend****"
pm2 stop AblogBack &
back_detenido=$!
wait $back_detenido

echo "****Iniciando reinicio de AblogBack****" &
echo "****Accediendo a /media/pi/NAS1/web/Ablog/backend****" &
cd /media/pi/NAS1/web/Ablog/backend &
rutaCorrecta=$!
echo $rutaCorrecta
pm2 start /media/pi/NAS1/web/Ablog/backend/src/index.js --name AblogBack 
echo "****pm2 AblogBack Iniciado****"

