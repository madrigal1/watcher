const inquirer = require("inquirer");

var questions = [
    {
        type:"input",
        name:"name",
        message:"What is your name",
    },
];

inquirer.prompt(questions).then((answers)=>{
    console.log(`New Hello ${answers["name"]}`);
})