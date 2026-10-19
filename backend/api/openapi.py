from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = 'users.authentication.CookieJWTAuthentication'
    name = 'cookieJwt'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': 'access_token',
            'description': 'JWT access cookie. Unsafe browser requests also require X-CSRFToken.',
        }
