# Simple rebuilg script (mainly used in GitPod)
# to clean up the working directories and redeploy
# locally

#!/bin/bash

if [[ "$workdir" ]];then
        cd $workdir
        echo "Kill and remove RunWhenLocal Container"
        docker kill RunWhenLocal; docker rm RunWhenLocal
        echo "Remocing shared output dir"
        sudo rm -rf $workdir/shared/output
        echo "Creating clean shared output dir"
        mkdir $workdir/shared/output
        chmod 777 $workdir/shared/output
        echo "Clean docker"
        ## Docker cleanup
        docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
        docker rmi $(docker images -q) -f
        docker rmi $(docker images | awk '{print $3}')
        docker volume rm $(docker volume ls | awk '{print $2}')
        echo "rebuild image" 
        docker build -t runwhen-local:test -f ../runwhen-local/src/Dockerfile ../runwhen-local/src/
        echo "Running RunWhenLocal container"
        #docker run --name RunWhenLocal -p 8081:8081 -e AUTORUN_WORKSPACE_BUILDER_INTERVAL=300 -e RW_LOCAL_UPLOAD_ENABLED=true  -e RW_LOCAL_UPLOAD_MERGE_MODE="keep-uploaded" -e RW_LOCAL_TERMINAL_DISABLED=false -v $workdir/shared:/shared -d runwhen-local:test
        docker run --name RunWhenLocal -p 8081:8081 -e RW_LOCAL_TERMINAL_DISABLED=false -v $workdir/shared:/shared -d runwhen-local:test
        sleep 5
        echo "Running discovery"
        docker exec -w /workspace-builder -- RunWhenLocal ./run.sh $1 --verbose
else
        echo "workdir variable/path not set"
fi