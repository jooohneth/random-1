/********************************************************************************
 * BTI325 – Assignment 02
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Thai Zyong Nguyen  Student ID: 153467220 Date: Sep 22, 2024
 *
 ********************************************************************************/

const projectData = require("./modules/projects");
const express = require("express");
const path = require("path");

const app = express(); // constructor
const HTTP_PORT = 3000;

function randomDeny(req, res, next) {
  let allowed = Math.floor(Math.random() * 2); // 0 or 1

  if (allowed) {
    next();
  } else {
    res.status(403).send("Access Denied");
  }
}

const main = async () => {
  await projectData.Initialize();

  app.use(express.static(path.join(__dirname, "/public")));

  // app.use((req, res, next) => {
  //   console.log(`Request from: ${req.get("user-agent")} [${new Date()}]`);
  //   next();
  // });

  app.set("view engine", "ejs");

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/about", randomDeny, (req, res) => {
    res.render("about");
    // res.redirect("https://blog.blast.io/vision/");
  });

  app.get("/solutions/projects", async (req, res) => {
    try {
      const sector = req.query.sector;
      if (sector) {
        const projectsBySector = await projectData.getProjectsBySector(sector);
        res.json(projectsBySector);
      } else {
        const allProjects = await projectData.getAllProjects();
        res.json(allProjects);
      }
    } catch (error) {
      res.status(404).render("404");
    }
  });

  app.get("/solutions/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await projectData.getProjectsById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
      res.json(project);
    } catch (error) {
      res.status(404).render("404");
    }
  });

  app.use((req, res, next) => {
    res.status(404).render("404");
  });

  app.listen(HTTP_PORT, () =>
    console.log(`listening: http://localhost:${HTTP_PORT}/`)
  );

  // app.get("/solutions/projects/sector-demo", async (req, res) => {
  //   try {
  //     res.send(await projectData.getProjectsBySector("ind"));
  //   } catch (error) {
  //     res.send(new Error("Something went wrong"));
  //   }
  // });
};

main();
