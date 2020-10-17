FROM manimdsl/manimdslcompiler

RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh

RUN apt-get install -y nodejs
COPY . /api/
WORKDIR /api

RUN cp /src/build/libs/ManimDSLCompiler-1.0-SNAPSHOT.jar compiler.jar

RUN npm install

RUN npm run build

ENTRYPOINT ["node", "dist/main.js"]
