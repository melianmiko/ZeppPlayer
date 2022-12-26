#!/usr/bin/bash

# This script will setup venv if required
# and run zp_server/main.py

init_venv()
{
	echo "Creating venv..."
	python -m venv venv
	venv/bin/pip install -r requirements.txt
	touch venv/.ready
}

[ ! -f venv/.ready ] && init_venv
venv/bin/python zp_server/main.py > /dev/null 2>&1 &
