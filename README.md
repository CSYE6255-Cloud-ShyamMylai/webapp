## Cloud Assignment 5

#### webapp manual
 - Kill all other servers in the back end may cause port number in use issue
 - Run the sql server in the background
 - Unzip the package and run `npm install`
 - copy the **.env** file which has the credentials 
 - run `node server.js`
 - Run all the tests using postman
 - Making a change workflow test added `npm test` to run the tests


#### Packer automation
- if required to create a new image in different project 
- create a service account under the role of `Compute Engine Admin` and `Service Account User`
- download the json file and move it to the root of the webapp folder and name it as credentials.json . Once done use file('path/to/credentials.json') in the in the source builder 
- downlaod the zip form the git repo 
- open the zip file in finder navigate inside webapp folder and then run the following command
- ` zip -r webapp-main.zip ./*`
- move the zip to the location of the root webapp folder
- cross verify if everything required for packer is present 
- MAKE SURE ALL THE **ENV ARE PRESENT using EXPORT AND SOURCE `~/.zshrc` (DB_HOST,DB_USERNAME,DB_PASSWORD,DB_DATABASE,NODE_PORT,GOOGLE_AUTH_SERVICE,IMAGE_NAME,etc[whatever used in packer file])**
- do `packer validate packer/templates/packer.pkr.hcl` 
- if everything is fine then do `packer build packer/templates/packer.pkr.hcl`
- once packer is done then the image will be created in the google cloud console cross verify 
- do terraform apply to the main.tf in other repo


#### References
-[Used this blog to start mysql without docker](https://ovirium.com/blog/how-to-make-mysql-work-in-your-github-actions/)
