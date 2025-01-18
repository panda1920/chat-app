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

WORKDIR /app
USER $UID
