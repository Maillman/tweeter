# Step 1
echo Creating new lambda layer
npm --prefix tweeter-shared run build
cp -r tweeter-shared/ tweeter-server/nodejs/node_modules/
cd tweeter-server/
zip -r nodejs.zip nodejs/

# Step 2
echo -e '\n\n'
read -p "Please upload the new nodejs.zip lambda layer to aws, then press Enter"
echo -e '\nPrepare to edit the .server file manually using Vim'
sleep 0.5
vi .server

# Step 3
npm run build
cd dist/
zip -r dist.zip lambda/ model/
mv dist.zip ../
cd ../

# Step 4
echo -e '\n\n\nUploading lambdas and updating layers'
./uploadLambdas.sh
./updateLayers.sh
echo -e '\n\nFinally finished!'
sleep 0.5
echo -e '\nPlease test the newly uploaded lambdas on aws!'