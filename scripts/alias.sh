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

function up() {
  local envFile="$ROOT_DIR/env/.env.local";
  
  cp $envFile "$ROOT_DIR/backend/.env";
  $COMPOSE_COMMAND up -d;
}

function upaws() {
  local envFile="$ROOT_DIR/env/.env.local.aws";
  
  cp $envFile "$ROOT_DIR/backend/.env";
  $COMPOSE_COMMAND up -d;
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
