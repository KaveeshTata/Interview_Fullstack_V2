## Flask Basic App

This is a basic Flask app that can be built and run in a Docker container.

## Build

To build the Docker image for this app, run the following command from the root directory of this repository:

docker build -t lpcdocks/flask-basic-app .

This will create a Docker image named lpcdocks/flask-basic-app based on the Dockerfile in this repository.

## Pull
If you prefer not to build the image yourself, you can pull the latest version of the image from Docker Hub using the following command:


docker pull lpcdocks/flask-basic-app:latest

## Run
To run the app in a Docker container, use the following command:


docker run -p 5000:5000 lpcdocks/flask-basic-app

This will start a container running the app and map port 5000 in the container to port 5000 on your local machine. You can access the app by opening a web browser and navigating to http://localhost:5000.

## Push
To push the Docker image to Docker Hub, follow these steps:

Login to Docker Hub using the docker login command.

Tag your image with your Docker Hub username and repository name:


docker tag lpcdocks/flask-basic-app lpcdocks/flask-basic-app

### Replace lpcdocks with your Docker Hub username.

Push your image to Docker Hub:


docker push username/flask-basic-app

This will push your image to Docker Hub, where it can be pulled by others using the docker pull command.

Finally, to verify that everything is working correctly, you can pull the latest version of your image using the following command:


docker pull username/flask-basic-app:latest

docker pull lpcdocks/flask-basic-app:latest

This command should pull the image you just pushed to Docker Hub.
