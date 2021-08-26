import { React } from "react"
import { GET_USER_BY_ID } from "../GraphQL/Queries"

import { useQuery } from "@apollo/client"
import { Row } from "react-bootstrap"
import AvatarImage from "./AvatarImage"

export default function FriendList({
  userId,
  setUserID,
  setUserNameChat,
  setChatAvatar,
  searchUser,
  setSearchUser,
}) {
  const { loading, error, data } = useQuery(GET_USER_BY_ID, {
    variables: { userId },
  })

  if (loading) return null
  if (error) return `Error! ${error}`

  function showAge(age) {
    if (age >= 0) return age
    else return " "
  }

  return (
    <>
      {
        /*This return the searched user */
        data.userOneById.name
          .toLowerCase()
          .includes(searchUser.toLowerCase()) && (
          
            <div
              className="user-one flex-row padding5"
              id="user-one"
              onClick={(e) => {
                e.preventDefault()
                //alert(data.userOneById._id)
                setUserID(data.userOneById._id)
               // const foundChat= userId.find((item) => item === data.userOneById._id ).chat
               // setSelectedChatID(foundChat)
                setUserNameChat(data.userOneById.name)
                setChatAvatar(data.userOneById.avatar)
                setSearchUser("")
              }}
            >
              <div id="user-avatar" key={data.userOneById._id}>
                <AvatarImage
                  avatarUrl={data.userOneById.avatar}
                  name={data.userOneById.name}
                />
              </div>
              <div className="padding5">
                <div>{data.userOneById.name}</div>
                {showAge(data.userOneById?.age)}
              </div>
              <div>{data.userOneById.aboutMe}</div>
            </div>
         
        )
      }
    </>
  )
}
