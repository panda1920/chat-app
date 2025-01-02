FROM node:22

# create user and group for docker to run on
# node image by default already has a user with 1000:1000
# so avoid creating duplicate if that is specified
ARG USERNAME=chat_user
ARG GROUPNAME=chat_group
ARG UID=1000
ARG GID=1000
RUN if [ "$GID" -ne 1000 ]; then \
    groupadd -g $GID $GROUPNAME; \
  fi && \
  if [ "$UID" -ne 1000 ]; then \
    useradd -m -s /bin/bash -u $UID -g $GID $USERNAME; \
  fi && \
  mkdir -p /app && chown -R ${UID}:${GID} /app

# install aws-cli and other utilities
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
RUN apt update -y && apt upgrade -y && \
  apt install -y unzip less && \
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
  unzip awscliv2.zip && \
  ./aws/install

WORKDIR /app
USER $UID
