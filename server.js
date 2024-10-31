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

const main = async () => {
  await projectData.Initialize();

  app.use(express.static(path.join(__dirname, "/public")));

  app.set("view engine", "ejs");
  app.set("views", __dirname + "/views");

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/about", (req, res) => {
    res.render("about");
    // res.redirect("https://blog.blast.io/vision/");
  });

  app.get("/solutions/projects", async (req, res) => {
    try {
      const sector = req.query.sector;

      if (!sector) {
        const projects = await projectData.getAllProjects();
        return res.render("projects", { projects });
      }

      const projectsBySector = await projectData.getProjectsBySector(sector);
      res.render("projects", { projects: projectsBySector });
    } catch (error) {
      res
        .status(404)
        .render("404", { message: `No projects found for this sector.` });
    }
  });

  app.get("/solutions/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await projectData.getProjectsById(projectId);

      res.render("project", { project });
    } catch (error) {
      res
        .status(404)
        .render("404", { message: "Unable to find requested project." });
    }
  });

  app.use((req, res, next) => {
    res.status(404).render("404", {
      message: "I'm sorry, we're unable to find what you're looking for.",
    });
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
