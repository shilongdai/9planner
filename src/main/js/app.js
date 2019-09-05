const React = require('react');
const ReactDOM = require('react-dom');

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const defaultRequest = require('rest/interceptor/defaultRequest');
const errorCode = require('rest/interceptor/errorCode');
const client = rest.wrap(mime).wrap(errorCode).wrap(defaultRequest, {headers: {'Accept': 'application/json'}});

class ScheduleSectionItem extends React.Component {

    constructor(props) {
        super(props);
        this.blacklist_current = this.blacklist_current.bind(this);
    }

    blacklist_current(event) {
        event.preventDefault();
        console.log(this.props.section);
        this.props.blacklist(this.props.section.id)
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
                <td><a href="#" onClick={this.blacklist_current}>blacklist</a></td>
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
                {this.props.sections.map((section) => <ScheduleSectionItem key={section.id} section={section}
                                                                           blacklist={this.props.blacklist}/>)}
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
                <ScheduleTableDisplay sections={this.props.schedule.sections} blacklist={this.props.blacklist}/>
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
                <CourseCreditForm setMetric={this.setMetric}/>
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