import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card'
import Button from "react-bootstrap/Button";
import Calendar from "@toast-ui/react-calendar";
import Modal from "react-bootstrap/Modal";

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


class CourseDisplayModal extends React.Component {

    constructor(props) {
        super(props);
        this.handleBlackList = this.handleBlackList.bind(this);
    }

    render() {
        return (
            <Modal show={this.props.course != null} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Remove Test</Modal.Title>
                </Modal.Header>
                <Modal.Body>Remove Test</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={this.handleBlackList}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }


    handleBlackList() {
        this.props.blacklist(this.props.course.id);
        this.props.closeModal();
    }

}


class ScheduleSectionsDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {lastClicked: null};
        this.displaySection = this.displaySchedule.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    displaySchedule(event) {
        if (this.state.lastClicked !== event.schedule.id) {
            this.setState({lastClicked: event.schedule.id})
        }
    }

    closeModal() {
        this.setState({lastClicked: null})
    }

    render() {
        let scheduleIdMap = {};
        let calendars = [];
        for (let item of this.props.courses) {
            let calColor = getRandomColor();
            calendars.push({
                id: item.id.toString(),
                name: item.subject + item.courseNumber.toString(),
                bgColor: calColor,
                borderColor: calColor,
            });
        }
        let schedules = [];
        let currentScheduleId = 0;
        let sectionMap = {};
        for (let item of this.props.sections) {
            let duration = getScheduleDuration(item);
            sectionMap[item.id] = item;
            for (let timeframe of duration) {
                scheduleIdMap[currentScheduleId] = item.id;
                schedules.push({
                    id: (currentScheduleId++).toString(),
                    calendarId: item.archtype.id.toString(),
                    title: item.archtype.subject + item.archtype.courseNumber + "-" + item.section,
                    category: "time",
                    start: timeframe.start.toISOString(),
                    end: timeframe.end.toISOString(),
                });
            }
        }

        let modalCourse = null;
        if (this.state.lastClicked != null) {
            modalCourse = sectionMap[scheduleIdMap[this.state.lastClicked]];
        }
        return (
            <>
                <Calendar usageStatistics={false} defaultView={"week"} disableDblClick={true} disableClick={true}
                          isReadOnly={true} taskView={false} scheduleView={true} useDetailPopup={false}
                          calendars={calendars}
                          schedules={schedules} onClickSchedule={this.displaySection}/>

                <CourseDisplayModal closeModal={this.closeModal} course={modalCourse} blacklist={this.props.blacklist}/>
            </>
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


class TimeFormEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDeleteForm = this.onDeleteForm.bind(this);
    }

    onInputChange(event) {
        this.props.setTimeslot(this.props.id, event.target.value)
    }

    onDeleteForm(event) {
        event.preventDefault();
        this.props.removeTimeForm(this.props.id)
    }

    render() {
        return (
            <fieldset>
                Time: <input type="text" onChange={this.onInputChange} value={this.props.value}/> <a href="#"
                                                                                                     onClick={this.onDeleteForm}>Remove</a>
            </fieldset>
        )
    }

}


class AvailableTimeForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentId: 6,
            timeslots: {
                1: "MONDAY 00:00-24:00",
                2: "TUESDAY 00:00-24:00",
                3: "WEDNESDAY 00:00-24:00",
                4: "THURSDAY 00:00-24:00",
                5: "FRIDAY 00:00-24:00"
            }
        };

        this.setTimeslot = this.setTimeslot.bind(this);
        this.removeTimeForm = this.removeTimeForm.bind(this);
        this.addTimeSlotEntry = this.addTimeSlotEntry.bind(this);
        this.updateMetric(this.state.timeslots);
    }

    setTimeslot(id, slot) {
        let new_slots = Object.assign({}, this.state.timeslots);
        new_slots[id] = slot;
        this.setState({timeslots: new_slots});
        this.updateMetric(new_slots);
    }

    removeTimeForm(id) {
        let new_slots = Object.assign({}, this.state.timeslots);
        delete new_slots[id];
        this.setState({timeslots: new_slots});
        this.updateMetric(new_slots);
    }

    addTimeSlotEntry(event) {
        event.preventDefault();
        let new_slots = Object.assign({}, this.state.timeslots);
        new_slots[this.state.currentId] = "MONDAY 00:00-24:00";

        this.setState({currentId: this.state.currentId + 1, timeslots: new_slots})
    }

    updateMetric(timeslots) {
        console.log("Update Metric Called on:");
        console.log(timeslots);
        let slot_map = {};
        for (let id in timeslots) {
            let slot = timeslots[id];
            let parts = slot.split(" ");
            let day = parts[0];
            if (!(day in slot_map)) {
                slot_map[day] = [];
            }

            let timerange = parts[1].split("-");
            let start_time = timerange[0].replace(":", "").padStart(4, "0");
            let end_time = timerange[1].replace(":", "").padStart(4, "0");
            slot_map[day].push({startTime: parseInt(start_time), endTime: parseInt(end_time)})
        }
        this.props.setMetric("allowedTimes", 1, slot_map);
    }

    render() {
        return (
            <div>
                <a href="#" onClick={this.addTimeSlotEntry}>Add</a>
                {Object.keys(this.state.timeslots).map((id) => <TimeFormEntry key={id} id={id}
                                                                              setTimeslot={this.setTimeslot}
                                                                              removeTimeForm={this.removeTimeForm}
                                                                              value={this.state.timeslots[id]}/>)}
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
                    <Card>
                        <Card.Header>
                            <Accordion.Toggle as={Button} variant="link" eventKey="3">
                                Available Times
                            </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="3">
                            <Card.Body>
                                <AvailableTimeForm setMetric={this.setMetric}/>
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