================================ Cloning the repo ====================================
1.
Starting of to get the repo to your local machine you need to clone it. 

Open this link: https://github.com/Jolle-Jay/Kvarters-Bion
press the green button that says code
copy the link ether http link or ssh link. 

2.
then open your terminal and run this command: 

git clone <http/ssh link> 

You should now see that the repo is downloaded so now you can navigate into the project.

=============================== Seting up the project ==================================
1.
When you have entered the directory for the projekt type: 
npm install 

You should now see a folder named node_modules and package-lock.json

2.
Next step is to change the content of file named: db-configTemplate.json
this file should match your database connection. 

3.
After changing the content you need to change the name of that file so it's named: 
db-config.json

================================ Ready to start ========================================

1.
To run the frontend you need to open the terminal and run the command: 
npm run dev

2.
After waiting a while so the terminal stands still with some oragne text you can open the local host
in your web browser.

3.
Now your ready to browse the website and make some bookings for the films listed. 
talk to the AI agent to help you find what your looking for. 

=============================== is something wrong? =====================================
To get started you need to check for your dotnet version downloaded on your pc. 

To check your version on dotnet open up your perfered terminal. 
________________________________________________________________________________________

dotnet --version
You should have at least version 10.x.xx

If your dotnet version is lower than 10 you need to install it first and restar your pc. 
________________________________________________________________________________________

We can see later if the react and vite is correct version by typing:
npm list react     <-- should say at least 19.x.x 
npm list vite      <-- should say at least 7.x.x
________________________________________________________________________________________

sometimes you need to write: 
npm audit fix


If the database is corrupted or something else in the database is acting up, you can change 
the false to a true, or make it not commentetd in the file DbQuery.cs 

after you have done this the database will be reseted and seeded with the default information.
============================================================================================