import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import UserCardSkeleton from "@/components/UserCardSkeleton";
import UserList from "@/components/UserList";
import { QueryKeys } from "@/constants/QueryKeys";
import { UserContext } from "@/context/user.context";
import userService from "@/service/user.service";
import { useContext, useState } from "react";
import { useQuery } from "react-query";

const AllUsers = () => {
	const [search, setSearch] = useState<string>("");

	const { authenticated: isAuthenticated, userProfile } =
		useContext(UserContext);
	// fetching all users
	const allUsers = useQuery({
		queryKey: [QueryKeys.Users],
		queryFn: userService.getAllUsers,
	});

	// fetch logged in user's following
	const currentUserFollowing = useQuery({
		queryKey: ["following", userProfile?._id],
		queryFn: async () => {
			if (!isAuthenticated || !allUsers.isSuccess || !userProfile) {
				// Return an empty array or handle the case appropriately
				return [];
			}

			const response = await userService.getUserFollowingById(userProfile?._id);
			return response;
		},
		enabled: isAuthenticated && allUsers.isSuccess,
	});

	const filter = search
		? allUsers?.data?.filter((user) =>
				user.username.toLowerCase().includes(search?.toLowerCase())
		  )
		: allUsers.data;

	return (
		<div className="flex justify-center m-10">
			<div className="flex flex-col w-[800px]">
				<div className="mb-10 text-5xl font-semibold text-center">
					Who to follow
				</div>
				<div className="mb-2 text-3xl">Refine recommendations</div>
				<div className="mb-10 text-muted-foreground">
					Adjust recommendations by updating what you’re following
				</div>
				<div className="w-full mb-10">
					<div className="grid gap-1.5">
						<Label htmlFor="description">Search</Label>
						<Input
							type="search"
							placeholder="Search tag"
							id="search"
							name="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>
				{allUsers.isLoading || currentUserFollowing.isLoading ? (
					<UserCardSkeleton />
				) : search === "" ? (
					<UserList
						profileUser={allUsers.data || []}
						currentUser={
							isAuthenticated
								? currentUserFollowing?.data?.[0]?.following || []
								: []
						}
					/>
				) : (
					<UserList
						profileUser={filter || []}
						currentUser={
							isAuthenticated
								? currentUserFollowing?.data?.[0]?.following || []
								: []
						}
					/>
				)}
			</div>
		</div>
	);
};

export default AllUsers;
