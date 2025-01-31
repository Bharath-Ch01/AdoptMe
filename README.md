Adopt-ME

This Project is a client-side Front-End Web App, developed Using React+Vite, HTML, CSS, and Javascript.

When a user enters the WebApp with the hosted URL Link(https://adoptme-fetch.netlify.app/) Please use a PC for a Better Experience, the USER will be directed to the landing page '/' and can enter Name and email to Login with login authentication done through the API provided by fetch

After authentication, the user will be directed to the '/search' page which displays the Api-fetched dog data dropdown and a carousel of Images and dog data 

Users will have the option to select or type and select the dog breed with updated results in the carousel or sort 'Asc' or 'Des' based on the Alphabetical order

User can add favorite and click on 'Find My Match' button to see the result under the carousel

Clicking on the 'Adopt!' button will give the user a Pop alert and they can be Logged out by clicking on 'Close'.


Running WebApp(Adopt-Me) on Local Device
Clone the Git Repo and Unzip
Open VS Code or any editor and in the Terminal, Cd to the unzipped folder
Run these commands and install the below dependencies( **Make Sure Node.js is installed in the PC** )

**1.npm install**

**2.npm install react-router-dom**

**3.npm install @mui/icons-material**

**4.npm install @mui/styled-engine**

**5.npm install @emotion/react @emotion/styled**

OR(for upstream conflicts) Use below

**6. yarn add @mui/icons-material**

**7. yarn add @mui/styled-engine**

**8. yarn add @emotion/react @emotion/styled**

if yarn is not recognized use this before yarn commands(6,7,8)

**npm install --global yarn**

then 

**9. npm run dev**
