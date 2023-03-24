#!/usr/bin/bash

# This script will setup venv if required
# and run zp_server/main.py

init_venv()
{
	echo "Creating venv..."
	python3 -m venv venv
	venv/bin/pip3 install -r requirements.txt
	touch venv/.ready
}

[ ! -f venv/.ready ] && init_venv

if [[ "$1" == "dev" ]]
then
	venv/bin/python3 -m zp_server
else
	venv/bin/python3 -m zp_server > /dev/null 2>&1 &
fi
