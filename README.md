# LMS API Endpoints
### Book Route
Method | URI | Param | Query
|--|--|--|--|
| `GET` | `/book/all` | none | none |
| `GET` | `/book/search` | none | `book_uuid=uuid`<br/>`book_author=authorName`<br/>`isbn=1234567890`<br/>`publisher=publisherName` |
| `POST` | `/book/create` | none | none |
| `PUT` | `/book/edit` | `uuid` | none |
| `DELETE` | `/book/delete` | `uuid` | none |

### Student Route
Method | URI | Param | Query
|--|--|--|--|
| `GET` | `/student/all` | none | none |
| `GET` | `/student/search` | none | `student_id=id`<br/>`email=email@gmail.com`<br/>`phone_no=1234567890` |
| `POST` | `/student/create` | none | none |
| `PUT` | `/student/edit` | `uuid` | none |
| `DELETE` | `/student/delete` | `uuid` | none |