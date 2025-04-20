FROM node:18.15.0-alpine
RUN apk add build-base python3 python3-dev py-pip jpeg-dev libpng-dev libjpeg-turbo-dev
# create destination directory
RUN mkdir -p /usr/src/stage-and-screen-theme
WORKDIR /usr/src/stage-and-screen-theme

# copy the app, note .dockerignore
COPY . /usr/src/stage-and-screen-theme/
RUN yarn install

# expose 3000 (Vite's default port) /
EXPOSE 3000

# set mode
ENV MOD=production

# start the app with --host to make it accessible from outside the container
CMD [ "yarn", "dev", "--host" ]
