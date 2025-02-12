#!/usr/bin/env bash
CUR_DIR=$(cd -- $(dirname -- ${BASH_SOURCE[0]:-$0}) && pwd)
ROOT_DIR=$CUR_DIR/..
COMPOSE_FILE=$ROOT_DIR/docker-compose.yml

COMPOSE_COMMAND="docker compose -f $COMPOSE_FILE"
BACKEND_EXEC_BASH="$COMPOSE_COMMAND exec -it backend bash -c"
WS_URL="ws://localhost:8080/ws"

alias down="$COMPOSE_COMMAND down"
alias logs="$COMPOSE_COMMAND logs"
alias sso-login="${BACKEND_EXEC_BASH} 'aws sso login --use-device-code'"
alias reload=". $CUR_DIR/alias.sh"

# start with local dynamo
function up() {
  upApp "$ROOT_DIR/scripts/awsenv/.env.local"
}

# start with dynamo in dev 
function updev() {
  upApp "$ROOT_DIR/scripts/awsenv/.env.dev"
}

# first param - awsenv file
# insert awsenv information to env file and starts the app
function upApp() {
  local awsFile="$1"
  local backendEnv="$ROOT_DIR/backend/.env"
  local wsHandlerEnv="$ROOT_DIR/ws-handler/.env"

  # check file existance
  if [ ! -f "$awsFile" ]; then
    echo -e "File $awsFile not found\nCreate the file and try again"
    return 1
  fi
  if [ ! -f "$backendEnv" ]; then
    echo -e "File $backendEnv not found\nCreating from example file..."
    cp $ROOT_DIR/backend/.env.example $backendEnv
  fi
  if [ ! -f "$wsHandlerEnv" ]; then
    echo -e "File $wsHandlerEnv not found\nCreating from example file..."
    cp $ROOT_DIR/ws-handler/.env.example $wsHandlerEnv
  fi

  replaceAWSSection $backendEnv $awsFile
  replaceAWSSection $wsHandlerEnv $awsFile
  
  $COMPOSE_COMMAND up -d;
}

# first param - file to edit
# second param - content of file to replace with
function replaceAWSSection () {
  # check file existance
  if [ ! -f "$1" ]; then
    echo -e "file $1 does not exist.\nCreate the file and try again"
    return 1
  fi
  if [ ! -f "$2" ]; then
    echo -e "file $2 does not exist.\nCreate the file and try again"
    return 1
  fi

  # find first and last occurent of the keyword AWS
  local firstLine=$(grep -n "AWS" "$1" | head -n1 | cut -d: -f1)
  local lastLine=$(grep -n "AWS" "$1" | tail -n1 | cut -d: -f1)

  # delete only when match is found
  if [ -n "$firstLine" ]; then
    sed -i "${firstLine},${lastLine}d" "$1"
  fi

  # insert content of replacement file
  if [ -z "$firstLine" ] || [ "$firstLine" -gt "$(wc -l < $1)" ]; then
    # just append when file is too short to be inserted
    cat "$2" >> "$1"
  else
    # insert into the specific line number
    # use placeholder to prevent uninteded overwrites
    local placeholder="### placeholder"
    sed -i "${firstLine}i ${placeholder}" "$1"
    sed -i -e "/${placeholder}/r $2" -e "/${placeholder}/d" $1
  fi
}

function goin() {
  $COMPOSE_COMMAND exec -it $1 bash
}

# reset local dynamodb
function resetDynamo() {
  deleteDynamo;
  setupDynamo;
}

# delete dynamo table
function deleteDynamo() {
  local endpoint=$($BACKEND_EXEC_BASH 'echo $AWS_ENDPOINT_URL_DYNAMODB');
  if [ -z "$endpoint" ]; then
    # when custom endpoint is not used, must be using dynamo in AWS
    echo "Deletion of AWS resource is forbidden. Switch to your local dynamo" 1>&2
    return 1;
  fi

  echo 'Deleting table in dynamo...';
  $BACKEND_EXEC_BASH ' \
    aws dynamodb delete-table --no-cli-pager --table-name ${DYNAMO_CHAT_TABLE_NAME} \
  ';
  echo 'Table deleted!';
}

# setup dynamo table
function setupDynamo() {
  echo 'Creating table in dynamo...';
  $BACKEND_EXEC_BASH ' \
    aws dynamodb create-table \
    --table-name ${DYNAMO_CHAT_TABLE_NAME} \
    --attribute-definitions \
      AttributeName=${DYNAMO_CHAT_TABLE_PARITION_KEY},AttributeType=S \
      AttributeName=${DYNAMO_CHAT_TABLE_SORT_KEY},AttributeType=S \
    --key-schema \
      AttributeName=${DYNAMO_CHAT_TABLE_PARITION_KEY},KeyType=HASH \
      AttributeName=${DYNAMO_CHAT_TABLE_SORT_KEY},KeyType=RANGE \
    --billing-mode \
      PAY_PER_REQUEST \
    --no-cli-pager \
  ';
  echo 'Table created!';
}

function connectws() {
  local chatId=${1:-test_chat}
  wscat -c "${WS_URL}/chat/${chatId}"
}
