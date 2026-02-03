using Microsoft.AspNetCore.Mvc;

namespace WEB_API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private static readonly List<User> Users = new List<User>();

        [HttpPost]
        public IActionResult Create([FromBody] CreateUserRequest request) 
        {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            var id = Guid.NewGuid();
            var user = new User
            {
                Id = id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Age = request.Age
            };

            Users.Add(user);
            return CreatedAtAction(
                nameof(GetById),
                new { id },
                user
                );
        }
        [HttpPut("{id}")]
        public IActionResult Update([FromBody] CreateUserRequest request, Guid id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = Users.Where(x => x.Id == id).FirstOrDefault();
            if (user == null)
            {
                return BadRequest(ModelState);
            }
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Age = request.Age;
            
            return CreatedAtAction(
                nameof(GetById),
                new { id },
                user
                );
        }

        [HttpGet("{id}")]
        public IActionResult GetById(Guid id) 
        {
            var user = Users.Where(x => x.Id == id).FirstOrDefault();
            if (user == null) { 
                return BadRequest(ModelState);
            }
            return Ok(user);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(Users.ToList());
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var user = Users.Where(x => x.Id == id).FirstOrDefault();
            if (user == null)
            {
                return BadRequest(ModelState);
            }

            Users.Remove(user);
            return GetAll();
        }

    }
}
