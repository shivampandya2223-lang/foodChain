import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { PermissionType, RoleType } from '../common/enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT.' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({
    summary: 'Create a user with role-aware creation rules',
    description:
      'Super Admin can create any user. Admin can create Owner/Employee. Owner can create Employee.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'User created without passwordHash.' })
  @ApiForbiddenResponse({ description: 'Role creation is not allowed.' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @Permissions(PermissionType.USER_READ, PermissionType.PERMISSION_MANAGE)
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'Returns all users without passwordHash.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my user profile' })
  @ApiOkResponse({ description: 'Returns the current user profile.' })
  getProfile(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.findById(currentUser.id);
  }

  @Get(':id')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.OWNER)
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'Returns one user without passwordHash.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.findByIdForCurrentUser(id, currentUser);
  }
}
