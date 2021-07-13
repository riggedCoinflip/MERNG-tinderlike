import { useEffect, useState, React } from "react"
import { GET_MY_INFO } from '../GraphQL/Queries'
import { UPDATE_USER } from '../GraphQL/Mutations'
import { useQuery, useMutation } from "@apollo/client"
import Languages from "./Languages"
import Friends from "./Friends"
import { ContextHeader} from "../constants"

import BlockedUsers from "./BlockedUsers"

import {
  Button,Container,
  Card, Form,
  Col,Image,
  Row, InputGroup,
  FormControl, ListGroup,
  Dropdown,
} from "react-bootstrap"

export default function Profile() {
 
  const [state, setState] = useState()
 
  const genderOptions = [
    "non_binary",
    "male",
    "female",
    "intersex",
    "transgender",
    "other",
    "intersex",
    "I prefer not to say",
  ]

  const { loading, error, data, refetch } = useQuery(GET_MY_INFO, ContextHeader)
  /*
  useEffect(() => {
    setState() 
    }, [])
*/
  useEffect(() => {
    if (data || !state) {
      refetch()
      setState(data?.userSelf)
      console.log("State from useEffect", state)

    }
  }, [data])

  //If F5
  


  const [updateUser, { data: dataUpdate }] = useMutation(UPDATE_USER, ContextHeader)

  //Get users data
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error, are you already logged in?!</p>

  //console.log("Data Mutation:", dataUpdate)
  console.log("MyInfo in data:", data.userSelf)

  const changeHandler = (e) => {
    e.persist() //important
    setState((state) => ({ ...state, [e.target.name]: e.target.value }))
  }

  const getValuesFromChild = (values) => {
    console.log("value from child", values)
    //   console.log('State getValuesFromChild: ', state.languages);
  }
  console.log("STATE.dateOfBirth", state?.dateOfBirth)

  function limitDate(input) {
    const output = input?.substring(0, 10) ?? "Date is unknown"
    return output
  }

  return (
    <div id="user-info">
      <Container>
        <Card.Title>Personal Info</Card.Title>
        <Form>
          <Row>
            <Col>
              <Image src="https://img.icons8.com/clouds/2x/name.png" rounded />
            </Col>
            <Col>
              <InputGroup className="mb-3" weight="50px">
                <InputGroup.Prepend>
                  <InputGroup.Text id="username-input">@</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  name="name"
                  value={state?.name}
                  onChange={changeHandler}
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                />
              </InputGroup>
              <Dropdown>
                <Dropdown.Toggle
                  size="sm"
                  variant="success"
                  id="dropdown-gender"
                >
                  {state?.gender}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {genderOptions &&
                    genderOptions.map((selectedGender, index) => {
                      return (
                        <Dropdown.Item
                          name="gender"
                          onClick={(e) => {
                            e.preventDefault()

                            console.log("Gender selected: ", selectedGender)
                            setState((state) => ({
                              ...state,
                              gender: selectedGender,
                            }))
                          }}
                          key={index + 1}
                        >
                          {selectedGender}
                        </Dropdown.Item>
                      )
                    })}
                </Dropdown.Menu>
              </Dropdown>
              Date of birth
              <FormControl
                id="dateOfBirth"
                name="dateOfBirth"
                placeholder="yyyy-mm-dd"
                /*type="date"*/
                type="text"
                value={limitDate(state?.dateOfBirth)}
                onChange={changeHandler}
              />
              IngameRole
              <ListGroup horizontal>
                {state?.ingameRole ? (
                  state?.ingameRole &&
                  state?.ingameRole.map((data, index) => {
                    return (
                      <ListGroup.Item variant="dark" key={index + 1}>
                        {data}
                      </ListGroup.Item>
                    )
                  })
                ) : (
                  <p>There're not IngameRole selected</p>
                )}
              </ListGroup>
              <br />
              {/**/}
              <Languages
                getValuesFromChild={getValuesFromChild}
                state={state}
                setState={setState}
              />
              <br />
            </Col>{" "}
          </Row>


          <Row>
            <Form.Text className="text-muted">About me</Form.Text>

            <Form.Control
              as="textarea"
              rows={3}
              value={state?.aboutMe}
              id="aboutMe"
              onChange={changeHandler}
              name="aboutMe"
              type="text"
            />
          </Row>

          <br />

          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                updateUser({
                  variables: {
                    aboutMe: state.aboutMe,
                    gender: state.gender,
                    languages: state.languages,
                    dateOfBirth: state.dateOfBirth,
                  },
                })
                alert("Data was updated")

                //get new data after mutation
                refetch()
              }}
            >
              {" "}
              Save changes{" "}
            </Button>
            {"  "}
            <br />
          </div>
        </Form>
        <br />
        <Friends data={data} />
        <BlockedUsers data={data} />
      </Container>
    </div>
  )
}
