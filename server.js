/********************************************************************************
 * BTI325 – Assignment 06
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Thai Zyong Nguyen  Student ID: 153467220 Date: Nov 28, 2024
 *
 * Published: https://random-1.vercel.app/
 *
 ********************************************************************************/

const projectData = require("./modules/projects");
const express = require("express");
const path = require("path");
const clientSessions = require("client-sessions");

const app = express(); // constructor
const HTTP_PORT = process.env.PORT || 3000;

const authData = require("./modules/auth-service");

const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));

// set up client sessions
app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SECRET,
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  app.locals.session = req.session;
  next();
});

const main = async () => {
  try {
    await projectData.Initialize();
    await authData.Initialize();
  } catch (err) {
    console.log(`unable to start server: ${err}`);
  }

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

  app.get("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
      const sectors = await projectData.getAllSectors();

      res.render("addProject", { sectors: sectors });
    } catch (error) {
      res.status(404).render("404", { message: "Unable to add project." });
    }
  });

  app.post("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
      await projectData.addProject(req.body);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", { message: "Unable to add project.  " });
    }
  });

  app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
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

  app.post("/solutions/editProject", ensureLogin, async (req, res) => {
    try {
      await projectData.editProject(req.body.id, req.body);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
    try {
      await projectData.deleteProject(req.params.id);
      res.redirect("/solutions/projects");
    } catch (error) {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${error}`,
      });
    }
  });

  app.get("/login", (req, res) => {
    res.render("login", {
      errorMessage: "",
      userName: "",
    });
  });

  app.post("/login", async (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    try {
      let user = await authData.checkUser(req.body);
      const { userName, email, loginHistory } = user;

      req.session.user = {
        userName,
        email,
        loginHistory,
      };

      res.redirect("/solutions/projects");
    } catch (err) {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName,
      });
    }
  });

  app.get("/register", (req, res) => {
    res.render("register", {
      errorMessage: "",
      successMessage: "",
      userName: "",
    });
  });

  app.post("/register", async (req, res) => {
    try {
      await authData.registerUser(req.body);

      res.render("register", {
        errorMessage: "",
        successMessage: "User created",
        userName: "",
      });
    } catch (err) {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName,
      });
    }
  });

  app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
  });

  app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
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
