# Developing RunWhen Local
RunWhen Local is packaged up in a single container image which encompasses all components required to function properly. While you may be able to set up your environment to support testing your changes without the need to build the container image, this documentation currently only covers building and testing the container image. 

For a high-level overview of the internal components, please see the [ARCHITECTURE](./ARCHITECTURE.md) docs. 

### Requirements
- Docker (or equiavalent) container build utilities 

## Building the image
From the forked or cloned repository, building the image with docker is as follows: 

```
# Set and create a working directory
export workdir=~/runwhen-local
mkdir -p $workdir/shared/output;
chmod 777  $workdir/shared/output;

cd src/
docker build -t runwhen-local:test -f Dockerfile .
```

## Testing the image
In order to test the image, a valid `kubeconfig` and `workspaceInfo.yaml` file must exist. Please see the [Running Locally](https://docs.runwhen.com/public/runwhen-local/getting-started/running-locally) documentation for instructions on this task. 
With those files available and ready, you can run the image as normal. 

- Testing with built in generation and customization rules
```
docker run --name RunWhenLocal -p 8081:8081 -v $workdir/shared:/shared -d runwhen-local:test
docker exec -w /workspace-builder -- RunWhenLocal ./run.sh
```

- Testing while live editing generation and customization rules
```
git_repo_path=[FULL PATH TO GIT REPO BASE]
cd $workdir; docker run --name RunWhenLocal -p 8081:8081 -v $workdir/shared:/shared -v $git_repo_path/src/generation-rules:/workspace-builder/generation-rules -v $git_repo_path/src/templates:/workspace-builder/templates  -v $git_repo_path/src/map-customization-rules:/workspace-builder/map-customization-rules -d runwhen-local:test 
```
> Note: We are actively working on moving the generation rules and possibly customization rules out of the container image and alongside the troubleshooting libraries. 


## Cleanup
In order to clean up the docker image and files; 

```
docker kill RunWhenLocal; docker rm RunWhenLocal;  
sudo rm -rf  $workdir/shared/output;
```

## Troubleshooting

### View container logs
Many of the container logs are sent to stdout: 
```
docker attach RunWhenLocal
```

### Add verbosity
Adding verbosity might provide some additional error context in the logs: 

```
docker exec -w /workspace-builder -- RunWhenLocal ./run.sh --verbose
```

### Exec into the container
Need to poke around the container, exec right in: 

```
docker exec -it RunWhenLocal /bin/bash
```