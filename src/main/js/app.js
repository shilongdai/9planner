import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card'
import Button from "react-bootstrap/Button";
import Calendar from "@toast-ui/react-calendar";

const React = require('react');
const ReactDOM = require('react-dom');

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const defaultRequest = require('rest/interceptor/defaultRequest');
const errorCode = require('rest/interceptor/errorCode');
const client = rest.wrap(mime).wrap(errorCode).wrap(defaultRequest, {headers: {'Accept': 'application/json'}});


const WEEK_MAP = {
    "MONDAY": 1,
    "TUESDAY": 2,
    "WEDNESDAY": 3,
    "THURSDAY": 4,
    "FRIDAY": 5,
    "SATURDAY": 6,
    "SUNDAY": 0
};


function getWeekDay(day) {
    let date = new Date();
    let dayOfWeek = date.getDay();
    let diff = date.getDate() - dayOfWeek + day;
    return new Date(date.setDate(diff))
}


function getScheduleDuration(courseSection) {
    let courseStartTime = courseSection.startTime.toString().padStart(4, '0');
    let courseStartHr = courseStartTime.substr(0, 2);
    let courseStartMin = courseStartTime.substr(2, 2);
    let courseEndTime = courseSection.endTime.toString().padStart(4, '0');
    let courseEndHr = courseEndTime.substr(0, 2);
    let courseEndMin = courseEndTime.substr(2, 2);
    let result = [];

    for (let dayOfWeek of courseSection.dayOfWeek) {
        let start_time = getWeekDay(WEEK_MAP[dayOfWeek]);
        let end_time = getWeekDay(WEEK_MAP[dayOfWeek]);

        start_time.setHours(parseInt(courseStartHr));
        start_time.setMinutes(parseInt(courseStartMin));
        end_time.setHours(parseInt(courseEndHr));
        end_time.setMinutes(parseInt(courseEndMin));

        result.push({start: start_time, end: end_time})
    }

    return result;
}


function getRandomColor() {
    var letters = '0123456789abcdef';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


class ScheduleSectionsDisplay extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let calendars = [];
        let colors = {};
        for (let item of this.props.courses) {
            let calColor = getRandomColor();
            calendars.push({
                id: item.id.toString(),
                name: item.subject + item.courseNumber.toString(),
                bgColor: calColor,
                borderColor: calColor,
                color: calColor
            });
            colors[item.id] = calColor;
        }
        let schedules = [];
        let currentScheduleId = 0;
        for (let item of this.props.sections) {
            let duration = getScheduleDuration(item);
            for (let timeframe of duration) {
                schedules.push({
                    id: (currentScheduleId++).toString(),
                    trueId: item.id.toString(),
                    calendarId: item.archtype.id.toString(),
                    title: item.archtype.subject + item.archtype.courseNumber + "-" + item.section,
                    category: "time",
                    start: timeframe.start.toISOString(),
                    end: timeframe.end.toISOString(),
                    isReadOnly: true,
                    bgColor: colors[item.id],
                    borderColor: colors[item.id],
                    color: colors[item.id]
                });
            }
        }
        return (
            <Calendar usageStatistics={false} defaultView={"week"} disableDblClick={true} disableClick={true}
                      isReadOnly={true} taskView={false} scheduleView={true} useDetailPopup={true} calendars={calendars}
                      schedules={schedules}/>
        )
    }
}


class ScheduleResultDisplay extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        let coursesSet = new Set();
        let section;
        let courses = [];
        for (section of this.props.schedule.sections) {
            if (coursesSet.has(section.archtype.id)) {
                continue
            }
            coursesSet.add(section.archtype.id);
            courses.push(section.archtype)
        }
        return (
            <div>
                <ScheduleSectionsDisplay courses={courses} sections={this.props.schedule.sections}
                                         blacklist={this.props.blacklist}/>
                <p>Total Credits: {this.props.schedule.totalCredit}</p>
            </div>
        )
    }

}

class CourseProfileFormEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onInputChange(event) {
        this.props.setCourse(this.props.id, event.target.value);
    }

    onDelete(event) {
        event.preventDefault();
        this.props.removeCourseForm(this.props.id);
    }

    render() {
        return (
            <fieldset>
                Course: <input type="text" onChange={this.onInputChange}/>
                <a onClick={this.onDelete} href="#">remove</a>
            </fieldset>
        );
    }

}

class CourseCreditForm extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this)
    }

    onInputChange(event) {
        this.props.setMetric("creditHour", 1, {targetUnits: event.target.value})
    }

    render() {
        return (
            <fieldset>
                Target Credit Hours: <input type="text" onChange={this.onInputChange}/>
            </fieldset>
        );
    }

}

class SubjectPriorityEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onFormChange = this.onFormChange.bind(this);
    }


    onFormChange(event) {
        this.props.updateMetric(this.props.subject, event.target.value)
    }

    render() {
        return (
            <fieldset>
                {this.props.subject}: <input type="text" onChange={this.onFormChange}/>
            </fieldset>
        )
    }

}

class SubjectPriorityForm extends React.Component {

    constructor(props) {
        super(props);
        this.subjects = {};
        this.updateSubjectList(props.courses);
        this.updateMetric = this.updateMetric.bind(this);
    }

    updateMetric(subject, priority) {
        this.subjects[subject] = priority;
        this.props.setMetric("subjectPriority", 1, {ordering: this.subjects});
    }

    updateSubjectList(courses) {
        let subjects = new Set();
        for (let i in courses) {
            let course = courses[i];
            if (course.trim().length === 0) {
                continue;
            }
            let s = course.split(" ");
            subjects.add(s[0]);
        }
        let subjectMap = {};
        for (let s of subjects) {
            if (!(s in this.subjects)) {
                subjectMap[s] = 1
            } else {
                subjectMap[s] = this.subjects[s];
            }
        }
        this.subjects = subjectMap;
    }

    render() {
        this.updateSubjectList(this.props.courses);
        return (
            <div>
                {Object.keys(this.subjects).map((subject) => <SubjectPriorityEntry key={subject} subject={subject}
                                                                                   updateMetric={this.updateMetric}/>)}
            </div>
        )
    }

}

class CourseProfileForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentId: 2,
            metrics: {},
            courses: {
                1: ""
            }
        };
        this.setCourse = this.setCourse.bind(this);
        this.removeCourseForm = this.removeCourseForm.bind(this);
        this.addCourseFormEntry = this.addCourseFormEntry.bind(this);
        this.onSubmitInput = this.onSubmitInput.bind(this);
        this.setMetric = this.setMetric.bind(this);
    }

    setCourse(id, course) {
        let new_courses = Object.assign({}, this.state.courses);
        new_courses[id] = course;
        this.setState({courses: new_courses});
    }

    removeCourseForm(id) {
        let new_courses = Object.assign({}, this.state.courses);
        delete new_courses[id];
        this.setState({courses: new_courses});
    }

    addCourseFormEntry(event) {
        event.preventDefault();
        let new_courses = Object.assign({}, this.state.courses);
        new_courses[this.state.currentId] = "";

        this.setState({
            currentId: this.state.currentId + 1,
            courses: new_courses
        })
    }

    setMetric(name, scale, metric_detals) {
        let existing_metrics = Object.assign({}, this.state.metrics);
        existing_metrics[name] = {scale: scale, details: metric_detals};
        this.setState({metrics: existing_metrics})
    }

    onSubmitInput(e) {
        e.preventDefault();
        let scheduleCourses = [];
        let self = this;
        for (let id in this.state.courses) {
            let name = this.state.courses[id];
            let subject = name.split(" ")[0];
            let courseNumber = name.split(" ")[1];
            client(
                {
                    method: "GET",
                    path: `/api/course/${subject}/${courseNumber}`
                }
            ).then(function (response) {
                scheduleCourses.push(response.entity.id);
                if (scheduleCourses.length === Object.keys(self.state.courses).length) {
                    self.props.setProfile({
                        blacklist: [],
                        metrics: self.state.metrics,
                        archtypeIds: scheduleCourses
                    })
                }
            })
        }
    }

    render() {
        return (
            <div>
                <Accordion defaultActiveKey="0">
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                Courses
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <a href="#" onClick={this.addCourseFormEntry}>new</a>
                                {Object.keys(this.state.courses).map((id) => <CourseProfileFormEntry key={id} id={id}
                                                                                                     setCourse={this.setCourse}
                                                                                                     removeCourseForm={this.removeCourseForm}/>)}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="1">
                                Credit Hours
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="1">
                            <Card.Body>
                                <CourseCreditForm setMetric={this.setMetric}/>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="2">
                                Subject Priorities
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="2">
                            <Card.Body>
                                <SubjectPriorityForm courses={this.state.courses} setMetric={this.setMetric}/>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
                <a href="#" onClick={this.onSubmitInput}>Submit</a>
            </div>
        );
    }

}

class NinePlannerApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            schedule: {
                totalCredit: 0,
                sections: []
            },
            profile: {
                metrics: {},
                archtypeIds: [],
                blacklist: []
            }
        };
        this.setProfile = this.setProfile.bind(this);
        this.blacklist = this.blacklist.bind(this);
    }

    setProfile(profile) {
        this.setState(
            {
                profile: profile
            }
        );
        client({
            method: "POST", path: "/api/plan/profile", mime: "application/json", entity: this.state.profile,
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            this.setState({schedule: response.entity})
        })
    }

    blacklist(id) {
        let old_profile = this.state.profile;
        let new_profile = Object.assign({}, old_profile);
        new_profile.blacklist.push(id);
        this.setProfile(new_profile);
    }

    render() {
        return (
            <div>
                <CourseProfileForm setProfile={this.setProfile}/>
                <ScheduleResultDisplay schedule={this.state.schedule} blacklist={this.blacklist}/>
            </div>
        );
    }

}

ReactDOM.render(
    <NinePlannerApp/>,
    document.getElementById('react')
);