
#!/bin/bash
source .env/bin/activate

#check if a virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "No virtual environment activated"
    exit 1
fi

#check if nohup is installed
if ! command -v nohup &> /dev/null
then
    echo "nohup could not be found"
    exit 1
fi

# Commande pour exécuter le script Python avec nohup
nohup python app.py > output.log 2>&1 &

echo "Server started"
