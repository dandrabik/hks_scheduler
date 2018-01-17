$(function() {
  const classes = data.classes;
  var myClasses = [];

  const courseID = "Course ID";
  const courseNO = "Course No";
  const courseTitle = "Title";
  const courseFaculty = "Faculty";
  const courseTerm = "Term";
  const courseCredits = "Credits"
  const courseTime = "Class Time";
  const courseDay = "Class Day";
  const courseSection = "Section";
  const courseReviewDay = "Review Day";
  const courseReviewRoom = "Review Room";
  const courseReviewTime = "Review Time";

  const fallTerm = "Fall";
  const fallOneTerm = "Fall 1";
  const fallTwoTerm = "Fall 2";
  const springTerm = "Spring";
  const springOneTerm = "Spring 1";
  const springTwoTerm = "Spring 2";
  const januaryTerm = "January";
  const fallOne = "FallOne";
  const fallTwo = "FallTwo";
  const springOne = "SpringOne";
  const springTwo = "SpringTwo";
  const quantCourseIDs = data.quantClassIDs;
  const mldCourseIDs = data.mldClassIDs;
  const politicalCourseIDs = data.politicalClassIDs;
  const successClass = 'green';
  const storedCourses = "hksClassChoices";


  const termMapping = {
    [fallTerm]: fallTerm,
    [fallOneTerm]: fallOne,
    [fallTwoTerm]: fallTwo,
    [springTerm]: springTerm,
    [springOneTerm]: springOne,
    [springTwoTerm]: springTwo,
    [januaryTerm]: januaryTerm
  }

  const calMapping = {
    [fallTerm]: [fallOne, fallTwo],
    [fallOneTerm]: [fallOne],
    [fallTwoTerm]: [fallTwo],
    [springTerm]: [springOne, springTwo],
    [springOneTerm]: [springOne],
    [springTwoTerm]: [springTwo],
    [januaryTerm]: [januaryTerm]
  }
  // use an array to maintain order
  const fallCalendarOrder = [
    [fallOne, fallOneTerm],
    [fallTwo, fallTwoTerm],
    [springOne, springOneTerm],
    [springTwo, springTwoTerm]
  ]
  const springCalendarOrder = [
    fallCalendarOrder[2],
    fallCalendarOrder[3],
    fallCalendarOrder[0],
    fallCalendarOrder[1]
  ]

  const monthDigit = new Date().getMonth()
  const showFallFirst = (monthDigit <= 10 && monthDigit > 6)
  const calendarSections = showFallFirst ? fallCalendarOrder : springCalendarOrder

  const colors = ["red", "red2", "blue", "blue2", "green", "green2", "purple", "purple2", "yellow", "yellow2", "orange", "orange2", "tan", "tan2"]

  const $courseList = $("#js-courses dl");
  const $body = $("body");
  const jsCreditCounter = $body.find("#js-credits");
  const jsCalendar = $body.find("#js-calendar");
  const $showSectionsCheckbox = $body.find("#js-show-sections");
  const quantList = $body.find("#js-quant");
  const mldList = $body.find("#js-mld");
  const politicsList = $body.find("#js-politics");

  // add classes to the page.
  loadClasses();
  loadCalendars();

  // bind after course loaded
  const $classCheckboxes = $courseList.find('dt input');

  function loadClasses() {
    classes.forEach(function(course) {
      $courseList.append(courseTemplate(course));
    });
  }
  function loadCalendars() {
    calendarSections.forEach(function(selectorLabelArray) {
      jsCalendar.append(weekTemplate(selectorLabelArray[0], selectorLabelArray[1]));
    });
  }

  function courseTemplate(course) {
    const section = !(course[courseSection] === null || course[courseSection] === "B")
    return `<dt class="${section ? "hide" : ""} ${section ? "js-section" : "" }">
              <label>
              <input type="checkbox" id='${course[courseID]}'/>
                ${course[courseNO]}
                ${section ? course[courseSection] : ""}
                [${course[courseTerm]}]
                ${course[courseTitle]} -
                ${course[courseFaculty]}
              </label>
            </dt>`;
  }
  function courseListTemplate(course) {
    return `<li class="${course[courseID]}">
              ${course[courseNO]} -
              <i>${course[courseTitle]}</i> -
              <b>${course[courseFaculty]}</b>
              (${course[courseDay]} ${course[courseTime]})
              (<a class="js-remove-link" data-course="${course[courseID]}">Remove</a>)
            </li>`;
  }
  function courseRequirementTemplate(course) {
    return `<li class="${course[courseID]}">
              ${course[courseNO]} -
              ${course[courseCredits]} Credits
            </li>`;
  }

  function scheduleTemplate(course, color, review) {
    return `<div class="${color} ${course[courseID]} timeSlot time${course[review ? courseReviewTime : courseTime].replace(/(:|-|\s)/g, "")}">
              <div>${review ? course[courseReviewTime] : course[courseTime]}</div>
              <div>
                ${review ? 'Review - ' : ""}
                ${course[courseTitle]}
              </div>
            </div>`;
  }
  function weekTemplate(selector, label) {
    return `<div class="js-${selector}">
            <h2>${label} Week</h2>
            <table class="cal">
              <tr>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
              </tr>
              <tr>
                <td class="day M"></td>
                <td class="day T"></td>
                <td class="day W"></td>
                <td class="day Th"></td>
                <td class="day F"></td>
              </tr>
            </table>
          </div>`
  }

  $classCheckboxes.change(function(){
    const course = findClass(this.id)
    const added = this.checked === true

    added ? addCourse(course) : removeCourse(course)

    setCredits();
    updateLocalStorage();
    setRequirements(quantCourseIDs, quantList);
    setRequirements(mldCourseIDs, mldList);
    setRequirements(politicalCourseIDs, politicsList);
  });

  // load saved courses, after callbacks are in place
  if (localStorage.getItem(storedCourses)) {
    const storedCourseIDs = JSON.parse(localStorage.getItem(storedCourses));
    storedCourseIDs.forEach(function(storedCourseID){
      const $checkbox = $body.find("#" + storedCourseID);

      $checkbox.prop('checked', true).change();
    })
  }

  // make 'remove' button just uncheck the box in the list
  $(document).on('click', "a.js-remove-link",function(){
    $checkbox = $body.find("#" + $(this).data("course"))

    $checkbox.prop('checked', false).change()
  });

  $showSectionsCheckbox.change(function(){
    if (this.checked === true) {
      $("dt").removeClass("hide")
    } else {
      $("dt.js-section").addClass("hide")
    }
  })

  // 'this' is an course key
  function findByID(element) {
    return element[courseID] == this;
  }

  function findClass(id) {
    return classes.find(findByID, id);
  }

  function removeCourse(course) {
    myClasses.splice($.inArray(course, myClasses),1)

    const id = course[courseID];
    $("." + id).remove();
  }

  function setCredits() {
    var credits = 0;
    myClasses.forEach(function(course){
      credits += parseInt(course[courseCredits]);
    })

    jsCreditCounter.html(credits);
    label = jsCreditCounter.parent();
    credits >= 32 ? label.addClass(successClass) : label.removeClass(successClass)
  }

  function setRequirements(list, target) {
    var credits = 0;
    target.html("") // reset classes
    myClasses
      .filter(function(course) {return list.indexOf(course[courseNO]) !== -1})
      .forEach(function(course){

        credits += parseInt(course[courseCredits]);
        target.append(courseRequirementTemplate(course));
      })

    const $label = target.parent().find(".js-req-header");
    credits >= 4 ? $label.addClass(successClass) : $label.removeClass(successClass)
  }

  function updateLocalStorage() {
    localStorage.setItem(
      storedCourses,
      JSON.stringify(
        myClasses.map(function(course) { return course[courseID]})
      )
    )
  }

  function addToList(course) {
    const term = course[courseTerm];
    const selector = termMapping[term];

    if (selector === undefined) { return }

    $body
      .find(".js-courses .js-" + selector + " ol")
      .append(courseListTemplate(course));
  }

  function addToCalendar(course, color, review) {
    const term = course[courseTerm];
    const calSelectors = calMapping[term];

    const dayData = review ? courseReviewDay : courseDay;
    const days = course[dayData] ? course[dayData].split("/") : []

    if (calSelectors === undefined) { return }

    days.forEach(function(day) {

      calSelectors.forEach( function(calSelector){
        $body
          .find("#js-calendar .js-" + calSelector + " ." + day)
          .append(scheduleTemplate(course, color, review))
      });
    });
  }

  function addCourse(course) {
    myClasses.splice(0,0,course);

    addToList(course);

    const color = colors[Math.floor(Math.random() * colors.length)];
    addToCalendar(course, color, false);
    addToCalendar(course, color, true);
  }
})