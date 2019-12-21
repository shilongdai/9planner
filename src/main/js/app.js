import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card'
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

import {Calendar, momentLocalizer, Views} from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

const React = require('react');
const ReactDOM = require('react-dom');

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const defaultRequest = require('rest/interceptor/defaultRequest');
const errorCode = require('rest/interceptor/errorCode');
const client = rest.wrap(mime).wrap(errorCode).wrap(defaultRequest, {headers: {'Accept': 'application/json'}});
const localizer = momentLocalizer(moment);


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


function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
}


class CourseDisplayModal extends React.Component {

    constructor(props) {
        super(props);
        this.handleBlackList = this.handleBlackList.bind(this);
    }

    render() {
        let name = "";
        let credit = 0;
        let building = "";
        let room = "";
        let instructor = "";
        let subject = "";
        let coursenum = 0;
        let section = 0;

        if (this.props.course != null) {
            subject = this.props.course.archtype.subject;
            coursenum = this.props.course.archtype.courseNumber;
            section = this.props.course.section;
            name = this.props.course.archtype.title;
            credit = this.props.course.archtype.units;
            building = this.props.course.building;
            room = this.props.course.room;
            instructor = this.props.course.instructor;
        }
        return (
            <Modal show={this.props.course != null} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{subject} {coursenum}-{section}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table>
                        <tbody>
                        <tr>
                            <td>Name</td>
                            <td>{name}</td>
                        </tr>
                        <tr>
                            <td>
                                Credit
                            </td>
                            <td>{credit}</td>
                        </tr>
                        <tr>
                            <td>
                                Building
                            </td>
                            <td>{building}</td>
                        </tr>
                        <tr>
                            <td>Room</td>
                            <td>{room}</td>
                        </tr>
                        <tr>
                            <td>Instructor</td>
                            <td>{instructor}</td>
                        </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.closeModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={this.handleBlackList}>
                        Blacklist
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
        this.displaySchedule = this.displaySchedule.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    displaySchedule(event, e) {
        if (this.state.lastClicked !== event.id) {
            this.setState({lastClicked: event.id})
        }
    }

    closeModal() {
        this.setState({lastClicked: null})
    }

    render() {
        let schedules = [];
        let sectionMap = {};
        for (let item of this.props.sections) {
            let duration = getScheduleDuration(item);
            sectionMap[item.id] = item;
            for (let timeframe of duration) {
                schedules.push({
                    title: item.archtype.subject + item.archtype.courseNumber + "-" + item.section,
                    start: timeframe.start,
                    end: timeframe.end,
                    allDay: false,
                    id: item.id
                });
            }
        }

        let modalCourse = null;
        if (this.state.lastClicked != null) {
            modalCourse = sectionMap[this.state.lastClicked];
        }
        return (
            <>
                <Calendar
                    events={schedules}
                    view={Views.WEEK}
                    localizer={localizer}
                    onView={(event) => {
                    }}
                    views={[Views.WEEK]}
                    toolbar={false}
                    onSelectEvent={this.displaySchedule}
                />

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
        let displayedCredit = 0;
        if (this.props.schedule.totalCredit !== -1) {
            displayedCredit = this.props.schedule.totalCredit;
        }
        return (
            <div>
                <ScheduleSectionsDisplay courses={courses} sections={this.props.schedule.sections}
                                         blacklist={this.props.blacklist}/>
                <p>Total Credits: {displayedCredit}</p>
            </div>
        )
    }

}

class CourseProfileFormEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.state = {error: null};
        this.name = "CourseProfileFormEntry" + this.props.id
    }


    onInputChange(event) {
        let course = event.target.value;
        let course_name = course.split(" ");
        if (course.trim().length === 0) {
            this.setState({error: null});
            this.props.setCourse(this.props.id, null);
            this.props.setFormError(this.name, false);
            return;
        }
        if (course_name.length !== 2) {
            this.setState({error: "Please Enter a Course in the Specified Format"});
            this.props.setCourse(this.props.id, null);
            this.props.setFormError(this.name, true);
            return;
        }
        let subject = course_name[0];
        let courseNumber = course_name[1];
        let self = this;
        client(
            {
                method: "GET",
                path: `/api/course/${subject}/${courseNumber}`
            }
        ).then(function (response) {
            self.props.setCourse(self.props.id, course);
            self.setState({error: null});
            self.props.setFormError(self.name, false);
        }, function (response) {
            self.setState({error: "Please Enter a Course in the Specified Format"});
            self.props.setCourse(self.props.id, null);
            self.props.setFormError(self.name, true);
        });
    }

    onDelete(event) {
        event.preventDefault();
        this.props.removeCourseForm(this.props.id);
    }

    render() {
        return (
            <Form.Group controlId={"courseForm" + this.props.id}>
                <InputGroup>
                    <Form.Control
                        placeholder="ex. DEPT 101"
                        aria-label="Course Department and Number"
                        aria-describedby="basic-addon2"
                        onChange={this.onInputChange}
                        isInvalid={!!this.state.error}
                    />
                    <InputGroup.Append>
                        <Button variant="outline-danger" href="#" onClick={this.onDelete}>Remove</Button>
                    </InputGroup.Append>

                    <Form.Control.Feedback type="invalid">
                        {this.state.error}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        );
    }

}

class CourseCreditForm extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.state = {error: null};
        this.name = "CourseCreditForm";
    }

    onInputChange(event) {
        let value = event.target.value;
        if (value.trim().length === 0) {
            this.setState({error: null});
            this.props.setMetric("creditHour", 1, {targetUnits: 0});
            this.props.setFormError(this.name, false);
            return;
        }
        if (isNumeric(value)) {
            this.setState({error: null});
            this.props.setMetric("creditHour", 1, {targetUnits: event.target.value});
            this.props.setFormError(this.name, false);
        } else {
            this.setState({error: "Please enter an integer"});
            this.props.setFormError(this.name, true);
        }
    }

    render() {
        return (
            <Form.Group>
                <Form.Label>Target Credit Hours</Form.Label>
                <Form.Control placeholder="0" onChange={this.onInputChange} isInvalid={!!this.state.error}/>
                <Form.Text className="text-muted">
                    The planner will try to match this, but it might not be possible to be exact
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    {this.state.error}
                </Form.Control.Feedback>
            </Form.Group>
        );
    }

}

class SubjectPriorityEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onFormChange = this.onFormChange.bind(this);
        this.state = {error: null};
        this.name = "SubjectPriorityEntry" + this.props.subject;
    }


    onFormChange(event) {
        let value = event.target.value;
        if (value.trim().length === 0) {
            this.setState({error: null});
            this.props.updateMetric(this.props.subject, 1);
            this.props.setFormError(this.name, false);
            return;
        }
        if (isNumeric(value)) {
            this.setState({error: null});
            this.props.updateMetric(this.props.subject, event.target.value);
            this.props.setFormError(this.name, false);
        } else {
            this.setState({error: "Please provide an integer as the priority"});
            this.props.setFormError(this.name, true);
        }
    }

    render() {
        return (
            <Form.Group controlId={"priority" + this.props.subject}>
                <Form.Label>{this.props.subject} Priority</Form.Label>
                <Form.Control placeholder={"Priority, the higher the more important"} onChange={this.onFormChange}
                              isInvalid={!!this.state.error}/>
                <Form.Control.Feedback type="invalid">
                    {this.state.error}
                </Form.Control.Feedback>
            </Form.Group>
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
                                                                                   updateMetric={this.updateMetric}
                                                                                   setFormError={this.props.setFormError}/>)}
            </div>
        )
    }

}


class TimeFormEntry extends React.Component {

    constructor(props) {
        super(props);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDeleteForm = this.onDeleteForm.bind(this);
        this.onDayChange = this.onDayChange.bind(this);
        this.state = {error: null, time_str: props.time};
        this.name = "TimeFormEntry" + this.props.id;
    }

    onInputChange(event) {
        let value = event.target.value;
        this.setState({time_str: value});
        if (value.trim().length !== 0) {
            if (!this.isTimeRange(value)) {
                this.setState({error: "Please enter a valid time range"});
                this.props.setTimeslot(this.props.id, "");
                this.props.setFormError(this.name, true);
                return;
            }
            this.props.setTimeslot(this.props.id, event.target.value);
            this.setState({error: null});
            this.props.setFormError(this.name, false);
        } else {
            this.props.setTimeslot(this.props.id, "");
            this.setState({error: null});
            this.props.setFormError(this.name, false);
        }
    }

    onDayChange(event) {
        this.props.setDaySlot(this.props.id, event.target.value)
    }

    onDeleteForm(event) {
        event.preventDefault();
        this.props.removeTimeForm(this.props.id)
    }

    isTimeRange(value) {
        if (!value.includes("-")) {
            return false;
        }
        let timerange = value.split("-");
        if (timerange.length !== 2) {
            return false
        }
        let start_time = timerange[0].replace(":", "").padStart(4, "0");
        let end_time = timerange[1].replace(":", "").padStart(4, "0");
        return isNumeric(start_time) && isNumeric(end_time);
    }

    render() {
        return (
            <Form.Group controlId={"timeForm" + this.props.id}>
                <InputGroup>
                    <select value={this.props.day} onChange={this.onDayChange}>
                        <option value="MONDAY">Monday</option>
                        <option value="TUESDAY">Tuesday</option>
                        <option value="WEDNESDAY">Wednesday</option>
                        <option value="THURSDAY">Thursday</option>
                        <option value="FRIDAY">Friday</option>
                        <option value="SATURDAY">Saturday</option>
                        <option value="SUNDAY">Sunday</option>
                    </select>
                    <Form.Control value={this.state.time_str} onChange={this.onInputChange}
                                  isInvalid={!!this.state.error}/>
                    <InputGroup.Append>
                        <Button variant="outline-danger" href="#" onClick={this.onDeleteForm}>Remove</Button>
                    </InputGroup.Append>
                    <Form.Control.Feedback type="invalid">
                        {this.state.error}
                    </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>
        )
    }

}


class AvailableTimeForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentId: 6,
            timeslots: {
                1: "00:00-24:00",
                2: "00:00-24:00",
                3: "00:00-24:00",
                4: "00:00-24:00",
                5: "00:00-24:00"
            },
            dayslots: {
                1: "MONDAY",
                2: "TUESDAY",
                3: "WEDNESDAY",
                4: "THURSDAY",
                5: "FRIDAY"
            }
        };

        this.setTimeslot = this.setTimeslot.bind(this);
        this.removeTimeForm = this.removeTimeForm.bind(this);
        this.addTimeSlotEntry = this.addTimeSlotEntry.bind(this);
        this.setDaySlot = this.setDaySlot.bind(this);
        this.updateMetric(this.state.timeslots, this.state.dayslots);
    }

    setTimeslot(id, slot) {
        let new_slots = Object.assign({}, this.state.timeslots);
        new_slots[id] = slot;
        this.setState({timeslots: new_slots});
        this.updateMetric(new_slots, this.state.dayslots);
    }

    setDaySlot(id, slot) {
        let new_slots = Object.assign({}, this.state.dayslots);
        new_slots[id] = slot;
        this.setState({dayslots: new_slots});
        this.updateMetric(this.state.timeslots, new_slots);
    }

    removeTimeForm(id) {
        let new_timeslots = Object.assign({}, this.state.timeslots);
        delete new_timeslots[id];
        let new_dayslots = Object.assign({}, this.state.dayslots);
        delete new_dayslots[id];
        this.setState({timeslots: new_timeslots, dayslots: new_dayslots});
        this.updateMetric(new_timeslots, new_dayslots);
    }

    addTimeSlotEntry(event) {
        event.preventDefault();
        let new_timeslots = Object.assign({}, this.state.timeslots);
        let new_dayslots = Object.assign({}, this.state.dayslots);

        new_timeslots[this.state.currentId] = "00:00-24:00";
        new_dayslots[this.state.currentId] = "MONDAY";

        this.setState({currentId: this.state.currentId + 1, timeslots: new_timeslots, dayslots: new_dayslots})
    }

    updateMetric(timeslots, dayslots) {
        let slot_map = {};
        for (let id in dayslots) {
            if (timeslots[id].trim().length === 0) {
                continue;
            }

            let day = dayslots[id];
            if (!(day in slot_map)) {
                slot_map[day] = [];
            }
            let timerange = timeslots[id].split("-");
            let start_time = timerange[0].replace(":", "").padStart(4, "0");
            let end_time = timerange[1].replace(":", "").padStart(4, "0");

            start_time = start_time.replace(" ", "");
            end_time = end_time.replace(" ", "");
            slot_map[day].push({startTime: parseInt(start_time), endTime: parseInt(end_time)})
        }
        this.props.setMetric("allowedTimes", 1, slot_map);
    }

    render() {
        return (
            <div>
                {Object.keys(this.state.timeslots).map((id) => <TimeFormEntry key={id} id={id}
                                                                              setTimeslot={this.setTimeslot}
                                                                              setDaySlot={this.setDaySlot}
                                                                              removeTimeForm={this.removeTimeForm}
                                                                              time={this.state.timeslots[id]}
                                                                              day={this.state.dayslots[id]}
                                                                              setFormError={this.props.setFormError}
                />)}
                <Button href="#" onClick={this.addTimeSlotEntry} variant="success">Add</Button>
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
            },
            errors: {}
        };
        this.setCourse = this.setCourse.bind(this);
        this.removeCourseForm = this.removeCourseForm.bind(this);
        this.addCourseFormEntry = this.addCourseFormEntry.bind(this);
        this.onSubmitInput = this.onSubmitInput.bind(this);
        this.setMetric = this.setMetric.bind(this);
        this.setFormError = this.setFormError.bind(this);
    }

    setCourse(id, course) {
        let new_courses = Object.assign({}, this.state.courses);
        if (course != null) {
            new_courses[id] = course;
        } else {
            new_courses[id] = "";
        }
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

    setFormError(name, has_error) {
        let existing_errors = Object.assign({}, this.state.errors);
        existing_errors[name] = has_error;
        this.setState({errors: existing_errors})
    }

    checkHasError() {
        let has_error = false;
        for (let key in this.state.errors) {
            if (this.state.errors[key]) {
                has_error = true;
                break;
            }
        }
        return has_error
    }


    onSubmitInput(e) {
        e.preventDefault();
        if (this.checkHasError()) {
            return;
        }

        let scheduleCourses = [];
        let self = this;
        let null_course = 0;
        for (let id in this.state.courses) {
            let name = this.state.courses[id];
            if (name === "") {
                null_course += 1;
                continue;
            }
            let subject = name.split(" ")[0];
            let courseNumber = name.split(" ")[1];

            client(
                {
                    method: "GET",
                    path: `/api/course/${subject}/${courseNumber}`
                }
            ).then(function (response) {
                scheduleCourses.push(response.entity.id);
                if (scheduleCourses.length === (Object.keys(self.state.courses).length - null_course)) {
                    self.props.setProfile({
                        blacklist: [],
                        metrics: self.state.metrics,
                        archtypeIds: scheduleCourses
                    })
                }
            })
        }
    }

    displayError() {
        if (this.checkHasError()) {
            return (
                <span> Please ensure that all forms are error-free</span>
            )
        } else {
            return (
                <span/>
            )
        }
    }

    render() {
        return (
            <div>
                <Form>
                    <Accordion defaultActiveKey="0">
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle as={Button} variant="link" eventKey="0">
                                    Courses
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    {Object.keys(this.state.courses).map((id) => <CourseProfileFormEntry key={id}
                                                                                                         id={id}
                                                                                                         setCourse={this.setCourse}
                                                                                                         removeCourseForm={this.removeCourseForm}
                                                                                                         setFormError={this.setFormError}/>)}
                                    <Button href="#" onClick={this.addCourseFormEntry} variant="success">New</Button>
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
                                    <CourseCreditForm setMetric={this.setMetric} setFormError={this.setFormError}/>
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
                                    <SubjectPriorityForm courses={this.state.courses} setMetric={this.setMetric}
                                                         setFormError={this.setFormError}/>
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
                                    <AvailableTimeForm setMetric={this.setMetric} setFormError={this.setFormError}/>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                    <br/>
                    <Button href="#" onClick={this.onSubmitInput}
                            variant="primary">Submit</Button> {this.displayError()}
                </Form>
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
            <Container>
                <Row>
                    <Col>
                        <h1>⑨Planner</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <CourseProfileForm setProfile={this.setProfile}/>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col>
                        <ScheduleResultDisplay schedule={this.state.schedule} blacklist={this.blacklist}/>
                    </Col>
                </Row>
            </Container>
        );
    }

}

ReactDOM.render(
    <NinePlannerApp/>,
    document.getElementById('react')
);