#!/bin/bash

echo "****Deteniendo backend****"
pm2 stop AblogBack &
back_detenido=$!
wait $back_detenido
echo "****Deteniendo frontend****"
pm2 stop AblogFront &
front_detenido=$!
wait $front_detenido

echo "****Iniciando reinicio de AblogBack****" &
echo "****Accediendo a /media/pi/NAS1/web/Ablog/backend****" &
cd /media/pi/NAS1/web/Ablog/backend &
rutaCorrecta=$!
echo $rutaCorrecta
echo "****Eliminando node_modules****"
rm -r node_modules &
eliminado=$!
wait $eliminado
echo "****node_modules eliminado correctamente****"
echo "****Instalando dependencias****"
npm install &
dependencias=$!
wait $dependencias
echo "****Dependencias instaladas****"
pm2 start npm run start --name AblogBack 
echo "****pm2 AblogBack Iniciado****"

echo "****Iniciando reinicio de AblogFront****" &
echo "****Accediendo a /media/pi/NAS1/web/Ablog/frontend****" &
cd /media/pi/NAS1/web/Ablog/frontend &
rutaCorrecta=$!
echo $rutaCorrecta
echo "****Eliminando node_modules****"
rm -r node_modules &
eliminado=$!
wait $eliminado
echo "****node_modules eliminado correctamente****"
echo "****Instalando dependencias****"
npm install &
dependencias=$!
wait $dependencias
echo "****Dependencias instaladas****"
pm2 start npm run start --name AblogFront 
echo "****pm2 AblogFront Iniciado****"