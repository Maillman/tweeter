#!/bin/bash

echo "Select the step to start from (1-4):"
read step

case $step in
    1)
        echo "Starting from Step 1"
        echo "Creating new lambda layer"
        npm --prefix tweeter-shared run build
        cp -r tweeter-shared/ tweeter-server/nodejs/node_modules/
        cd tweeter-server/
        zip -r nodejs.zip nodejs/
        cd ..
        echo -e '\n\n'
        read -p "Please upload the new nodejs.zip lambda layer to AWS, then press Enter"
        ;& # Fallthrough to the next step

    2)
        echo -e '\nPrepare to edit the .server file manually using Vim'
        sleep 0.5
        vi tweeter-server/.server
        ;& # Fallthrough to the next step

    3)
        echo "Building Tweeter Server to dist and zipping"
        cd tweeter-server/
        npm run build
        cd dist/
        zip -r dist.zip lambda/ model/
        mv dist.zip ../
        cd ../
        ;& # Fallthrough to the next step

    4)
        echo -e '\n\n\nUploading lambdas and updating layers'
        ./uploadLambdas.sh
        ./updateLayers.sh
        echo -e '\n\nFinally finished!'
        sleep 0.5
        echo -e '\nPlease test the newly uploaded lambdas on AWS!'
        ;;
    
    *)
        echo "Invalid step. Please enter a number between 1 and 4."
        exit 1
        ;;
esac
