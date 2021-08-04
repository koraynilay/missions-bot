#!/bin/sh
if ! which node >/dev/null 2>&1;then
	echo "Please install node. Exiting..."
	exit 1
fi
if ! which npm >/dev/null 2>&1;then 
	echo "Please install npm. Exiting..."
	exit 1
fi
echo "Installing all dependencies in package.json..."
npm install