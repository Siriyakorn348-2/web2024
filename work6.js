const RB = ReactBootstrap;
const { Alert, Card, Button, Table, Form, Row, Col } = RB;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjnORyVKVe33wfSQbC0r-T8T-rpk-HSeU",
  authDomain: "web2567-ce315.firebaseapp.com",
  projectId: "web2567-ce315",
  storageBucket: "web2567-ce315.firebasestorage.app",
  messagingSenderId: "826949178322",
  appId: "1:826949178322:web:15ee02e167d874925c6e0b",
  measurementId: "G-X7ZQRWQ58W",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


function StudentTable({ data, app }) {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{s.title}</td>
            <td>{s.fname}</td>
            <td>{s.lname}</td>
            <td>{s.email}</td>
            <td>{s.phone}</td>
            <td className="d-flex gap-2">
            <EditButton std={s} app={app}  />
            <DeleteButton std={s} app={app}/>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// ฟังก์ชันสำหรับ Input
function TextInput({ label, value, onChange, style }) {
  return (
    <Form.Group as={Row} controlId={label}>
      <Form.Label column sm={3}>{label}</Form.Label>
      <Col sm={9}>
        <Form.Control 
          type="text" 
          value={value} 
          onChange={onChange} 
          style={style} 
        />
      </Col>
    </Form.Group>
  );
}

function EditButton({std, app}) {
  return <Button variant="warning" onClick={() => app.edit(std)}>แก้ไข</Button>;
}

function DeleteButton({ std, app }) {
  return (
    <Button variant="danger" onClick={() => app.delete(std)}>ลบ</Button>
  );
}

function LoginBox(props) {
  const u = props.user;
  const app = props.app;
  if (!u) {
    return <Button variant="primary" onClick={() => app.google_login()}>Login</Button>;
  } else {
    return (
      <div className="mt-20">
      <img src={u.photoURL} alt="User" width={50} />
      <span>{u.email}</span>
      <Button variant="danger" onClick={() => app.google_logout()} 
        className="ms-3 mb-2"
      >
        Logout
      </Button>
    </div>
    
    );
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      students: [],
      stdid: "",
      stdtitle: "",
      stdfname: "",
      stdlname: "",
      stdemail: "",
      stdphone: "",
      scene: 0,
      user: null,
    };

    // ฟังการเปลี่ยนแปลงสถานะของ Firebase Auth
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.toJSON() });
      } else {
        this.setState({ user: null });
      }
    });

   
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
  }

  componentDidMount() {
    this.autoRead();
  }

  
  readData = () => {
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        const stdlist = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.setState({ students: stdlist });
      });
  };

  // Auto update 
  autoRead = () => {
    db.collection("students").onSnapshot((querySnapshot) => {
      const stdlist = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ students: stdlist });
    });
  };

  // เพิ่มหรืออัปเดตข้อมูล
  insertData = () => {
    db.collection("students")
      .doc(this.state.stdid)
      .set({
        title: this.state.stdtitle,
        fname: this.state.stdfname,
        lname: this.state.stdlname,
        phone: this.state.stdphone,
        email: this.state.stdemail,
      })
      .then(() => {
        alert("บันทึกข้อมูลสำเร็จ");
        this.setState({
          stdid: "",
          stdtitle: "",
          stdfname: "",
          stdlname: "",
          stdemail: "",
          stdphone: "",
        });
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาด: " + error.message);
      });
  };

  edit(std) {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  }

  delete = (std) => {
    if (window.confirm("ต้องการลบข้อมูล?")) {
      db.collection("students").doc(std.id).delete()
        .then(() => {
          alert("ลบข้อมูลสำเร็จ");
        })
        .catch((error) => {
          console.error("Error deleting document: ", error);
          alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        });
    }
  };

  google_login() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase.auth().signInWithPopup(provider);
  }

  google_logout() {
    if (confirm("Are you sure?")) {
      firebase.auth().signOut();
    }
  }

  render() {
    return (
      <Card className="p-4 my-3">
      <Card.Header as="h5" className="text-center d-flex justify-content-between">
          <span>Work 6 : ระบบจัดการนักศึกษา Firebase ด้วย ReactJS  </span>
          <LoginBox user={this.state.user} app={this} />
      </Card.Header>
              <Card.Body>
          <Button variant="primary" onClick={this.readData}>Read Data</Button>
          <Button variant="primary" onClick={this.autoRead} className="ms-2">Auto Read</Button>
          <div className="mt-4">
            <StudentTable data={this.state.students} app={this} />
          </div>
        </Card.Body>

        <div className="mb-2 w-100 d-flex justify-content-center">
        <h6>เพิ่ม/แก้ไขข้อมูล นักศึกษา</h6>
        </div>
          <Form className="d-flex flex-column align-items-center">
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="ID"
                value={this.state.stdid}
                onChange={(ev) => this.setState({ stdid: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="คำนำหน้า"
                value={this.state.stdtitle}
                onChange={(ev) => this.setState({ stdtitle: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="ชื่อ"
                value={this.state.stdfname}
                onChange={(ev) => this.setState({ stdfname: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="สกุล"
                value={this.state.stdlname}
                onChange={(ev) => this.setState({ stdlname: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="Email"
                value={this.state.stdemail}
                onChange={(ev) => this.setState({ stdemail: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div className="mb-2 w-100" style={{ maxWidth: '500px' }}>
              <TextInput
                label="Phone"
                value={this.state.stdphone}
                onChange={(ev) => this.setState({ stdphone: ev.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <Button variant="success" onClick={this.insertData} className="w-50 mt-3">
              Save
            </Button>
          </Form>
          <Card.Footer className="d-flex justify-content-center align-items-center mt-4">
          <p className="fs-15 text-center">
            By นางสาวสิริยากร อาจยางคำ 653380348-2 sec2<br />
            College of computing. Khon Kaen University
          </p>
        </Card.Footer>
      </Card>
    );
  }
}




// Render React App
ReactDOM.render(<App />, document.getElementById("myapp"));
