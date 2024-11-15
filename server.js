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
  app.use(express.urlencoded({ extended: true }));

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
    const sector = req.query.sector;

    try {
      if (!sector) {
        const projects = await projectData.getAllProjects();
        return res.render("projects", { projects });
      }

      const projectsBySector = await projectData.getProjectsBySector(sector);
      res.render("projects", { projects: projectsBySector });
    } catch (error) {
      res.status(404).render("404", {
        message: `No projects found for this sector: ${sector}`,
      });
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

  app.get("/solutions/addProject", async (req, res) => {
    try {
      const sectors = await projectData.getAllSectors();

      res.render("addProject", { sectors: sectors });
    } catch (error) {
      res.status(404).render("404", { message: "Unable to add project." });
    }
  });

  app.post("/solutions/addProject", async (req, res) => {
    try {
      await projectData.addProject(req.body);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", { message: "Unable to add project.  " });
    }
  });

  app.get("/solutions/editProject/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const [project, sectors] = await Promise.all([
        projectData.getProjectsById(projectId),
        projectData.getAllSectors(),
      ]);

      res.render("editProject", { sectors: sectors, project: project });
    } catch (error) {
      res
        .status(404)
        .render("404", { message: "Unable to find requested project." });
    }
  });

  app.post("/solutions/editProject", async (req, res) => {
    try {
      await projectData.editProject(req.body.id, req.body);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/solutions/deleteProject/:id", async (req, res) => {
    try {
      await projectData.deleteProject(req.params.id);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
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
