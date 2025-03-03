## Chat app
A simple chat application.  
The primary motivation for this project is to gain rudimentary experience in websocket and AWS dynamodb. I also tried to tinker with interesting technologies that I have come across along the way.

### Instructions to test the app locally
**prerequisites**
- docker
- bash shell

```bash
# clone the repository
git clone https://github.com/panda1920/chat-app.git
cd chat-app

# create file `scripts/awsenv/.env.local` from `scripts/awsenv/.env.local.example` and fill in the empty values. Make sure `AWS_REGION` is a valid region, but for every other keys any arbitrary value should be OK.
cp scripts/awsenv/.env.local.example scripts/awsenv/.env.local

# source utility shell alias/functions
. ./scripts/alias.sh

# start containers
up

# open file `test-chat/index.html` in your browser

# terminate containers once you are done
down
```


### Diagrams

#### Architecture
![architecture diagram local](docs/chat-architecture-local.webp)

#### Sequence
![sequence diagram](docs/chat-sequence-websocket.webp)
