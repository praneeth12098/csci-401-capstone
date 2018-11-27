# csci-401-capstone
Repo for hosting Letter of Recommendation Generator Capstone Project as of Fall 2018

## Deployment (as of Fall 2018)
Currently, our app is hosted on a server with IP address 68.181.97.191 on port 3000, with the MongoDB instance on the same IP address but at port 12345.

## How to Run Locally
+ Enter letterOfRecGenerator folder
+ Run `DEBUG=letterOfRecGenerator:* npm run devstart` (for debug on console) or `npm run devstart`
+ Open up a browser tab to `127.0.0.1:3000` (make sure port 3000 was not already occupied)

## Making Changes to Deployment (as of Fall 2018)
+ Ensure that any changes to be put on deployment are pushed into server-setup branch of this repo.
+ Run `ssh jeff@68.181.97.191`
+ Enter the password as `csci-401`
+ Run `cd csci-401-capstone/letterOfRecGenerator` from root directrory
+ Run `git pull` (Run `git branch` to ensure that the branch is server-setup. If not, run `git checkout server-setup`)
+ Run `mongod --port 12345`
+ Run `npm run devstart`

For the last step, you may need to kill the previous process on port 3000 using the following steps:
+ Run `sudo lsof -n -i :3000 | grep LISTEN`
+ Using the second number (the pid) in the result, run `kill ${PID}`

Afterwards, test to see if the app is properly running by accessing `68.181.97.191/login` on your browser.

## How to Install MongoDB
1. Go to [this link](https://www.mongodb.com/download-center?_ga=2.34334885.546969976.1519083876-785985683.1517259025#enterprise) and download the compressed files for your respective platform.
2. Extract the files from the downloaded archive.

   On Mac, run:
   
   ```
   tar -zxvf mongodb-osx-x86_64-enterprise-3.6.2.tgz
   ```
3. Copy the extracted archive to the target directory.

   On Mac, run:
  
   ```
   mkdir -p mongodb
   cp -R -n mongodb-osx-x86_64-enterprise-3.6.2/ mongodb
   ```
4. Ensure the location of the binaries is in the **PATH** variable.

   Add the following line to `~/.bashrc` or `~/.bash_profile`:
   
   ```
   export PATH=<mongodb-install-directory>/bin:$PATH
   ```
   
   Then, run:
   
   ```
   source ~/<.bashrc or .bash_profile>
   ```
5. Run MongoDB
   1. Create the data directory.
   
      This creates the default directory to which MongoDB will write data
      
      ```
      sudo mkdir -p /data/db
      ```
   2. Set permissions for the data directory.
   
  	  MongoDB will need read and write permissions
      
      ```
      sudo chmod 755 /data/db
      ```
   3. Run the `mongod` process.
      
      If the locations of the MongoDB binaries has been added to the **PATH** variable, then run:
      
      ```
      mongod
      ```
      
      Otherwise, run:
      
      ```
      <path to binary>/mongod
      ```
   4. Verify that MongoDB has started successfully.
      
      Check the process output for the following line:
      
      ```
      [initandlisten] waiting for connections on port 27017
      ```
      
      You should now be able to begin using MongoDB.
		
   
   
