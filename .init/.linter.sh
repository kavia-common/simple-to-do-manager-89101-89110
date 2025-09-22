#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-to-do-manager-89101-89110/todo_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

