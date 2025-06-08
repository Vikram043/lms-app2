const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());


function readDB(callback) {
  fs.readFile("db.json", "utf-8", (err, data) => {
    if (err) return callback(err);
    try {
      const db = JSON.parse(data);
      callback(null, db);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}


function writeDB(db, callback) {
  fs.writeFile("db.json", JSON.stringify(db, null, 2), callback);
}

// GET
app.get("/courses", (req, res) => {
  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });
    res.json(db.courses);
  });
});

// POST
app.post("/courses", (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });

    const newCourse = {
      id: Date.now().toString(),
      title,
      description,
    };

    db.courses.push(newCourse);

    writeDB(db, (err) => {
      if (err) return res.status(500).json({ error: "Failed to save course" });
      res.status(201).json({ message: "Course added", course: newCourse });
    });
  });
});

// PUT
app.put("/courses/:id", (req, res) => {
  const courseId = req.params.id;
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({ error: "At least one of title or description must be provided" });
  }

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });

    const courseIndex = db.courses.findIndex((course) => course.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update
    if (title) db.courses[courseIndex].title = title;
    if (description) db.courses[courseIndex].description = description;

    writeDB(db, (err) => {
      if (err) return res.status(500).json({ error: "Failed to update course" });
      res.json({ message: "Course updated", course: db.courses[courseIndex] });
    });
  });
});

// DELETE
app.delete("/courses/:id", (req, res) => {
  const courseId = req.params.id;

  readDB((err, db) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });

    const courseIndex = db.courses.findIndex((course) => course.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found" });
    }

    db.courses.splice(courseIndex, 1);

    writeDB(db, (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete course" });
      res.json({ message: "Course deleted" });
    });
  });
});


app.listen(PORT, () => {
  console.log(`LMS server running on http://localhost:${PORT}`);
});
