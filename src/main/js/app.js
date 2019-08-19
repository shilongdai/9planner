const React = require('react');
const ReactDOM = require('react-dom');

const rest = require('rest');
const mime = require('rest/interceptor/mime');
const defaultRequest = require('rest/interceptor/defaultRequest');
const errorCode = require('rest/interceptor/errorCode');
const client = rest.wrap(mime).wrap(errorCode).wrap(defaultRequest, {headers: {'Accept': 'application/json'}});

let testData = {
    targetCredit: 10,
    archtypeIds: [388, 393, 834, 943, 1295]
};

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
            </div>
        )
    }

}

class NinePlannerApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            schedule: {
                totalCredit: 0,
                sections: []
            }
        }
    }

    componentDidMount() {
        client({
            method: "POST", path: "/api/plan/profile", mime: "application/json", entity: testData,
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            this.setState({schedule: response.entity})
        })
    }

    render() {
        return (
            <ScheduleResultDisplay schedule={this.state.schedule}/>
        );
    }

}

ReactDOM.render(
    <NinePlannerApp/>,
    document.getElementById('react')
);