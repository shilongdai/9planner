const React = require('react');
const ReactDOM = require('react-dom');

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const defaultRequest = require('rest/interceptor/defaultRequest');
const errorCode = require('rest/interceptor/errorCode');
const client = rest.wrap(mime).wrap(errorCode).wrap(defaultRequest, {headers: {'Accept': 'application/json'}});

class ScheduleSectionItem extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <tr>
                <td>{this.props.section.archtype.subject}</td>
                <td>{this.props.section.archtype.courseNumber}</td>
                <td>{this.props.section.section}</td>
                <td>{this.props.section.dayOfWeek}</td>
                <td>{this.props.section.startTime}</td>
                <td>{this.props.section.endTime}</td>
            </tr>
        );
    }

}

class ScheduleTableDisplay extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <table>
                <thead>
                <tr>
                    <th>Subject</th>
                    <th>Course Number</th>
                    <th>Section</th>
                    <th>Days</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                </tr>
                </thead>
                <tbody>
                {this.props.sections.map((section) => <ScheduleSectionItem key={section.id} section={section}/>)}
                </tbody>
            </table>
        )
    }
}

class SemesterListDisplay extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return this.props.courses.map((c) => <li
            key={c.id}>{c.subject} {c.courseNumber}</li>)
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
                <SemesterListDisplay courses={courses}/>
                <ScheduleTableDisplay sections={this.props.schedule.sections}/>
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

class CourseProfileForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentId: 2,
            targetHours: 0,
            courses: {
                1: ""
            }
        };
        this.setCourse = this.setCourse.bind(this);
        this.removeCourseForm = this.removeCourseForm.bind(this);
        this.addCourseFormEntry = this.addCourseFormEntry.bind(this);
        this.onSubmitInput = this.onSubmitInput.bind(this);
        this.setTargetHours = this.setTargetHours.bind(this);
    }

    setCourse(id, course) {
        this.state.courses[id] = course
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

    setTargetHours(event) {
        this.setState({targetHours: event.target.value})
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
                        targetCredit: self.state.targetHours,
                        archtypeIds: scheduleCourses
                    })
                }
            })
        }
    }

    render() {
        return (
            <div>
                <fieldset>
                    Target Credit Hours: <input type="text" onChange={this.setTargetHours}/>
                </fieldset>
                <a href="#" onClick={this.addCourseFormEntry}>new</a>
                {Object.keys(this.state.courses).map((id) => <CourseProfileFormEntry key={id} id={id}
                                                                                     setCourse={this.setCourse}
                                                                                     removeCourseForm={this.removeCourseForm}/>)}
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
                targetCredit: 0,
                archtypeIds: []
            }
        };
        this.setProfile = this.setProfile.bind(this);
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

    render() {
        return (
            <div>
                <CourseProfileForm setProfile={this.setProfile}/>
                <ScheduleResultDisplay schedule={this.state.schedule}/>
            </div>
        );
    }

}

ReactDOM.render(
    <NinePlannerApp/>,
    document.getElementById('react')
);