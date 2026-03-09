import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Application types
  type Participant = {
    name : Text;
    sesaId : Text;
    registeredAt : Int;
  };

  type Submission = {
    sesaId : Text;
    name : Text;
    boardState : [Nat];
    timeTakenSeconds : Nat;
    isCorrect : Bool;
    submittedAt : Int;
  };

  let participants = Map.empty<Text, Participant>();
  let submissions = Map.empty<Text, Submission>();

  let clues = [
    6, 5, 4, 0, 0, 1, 0, 3, 2,
    0, 7, 0, 3, 2, 0, 1, 0, 0,
    1, 0, 0, 6, 4, 7, 0, 5, 8,
    0, 4, 5, 0, 6, 3, 0, 0, 9,
    7, 0, 0, 4, 0, 0, 3, 2, 6,
    3, 2, 6, 9, 0, 8, 7, 4, 5,
    2, 0, 3, 0, 0, 4, 0, 8, 0,
    5, 6, 9, 1, 0, 2, 4, 0, 0,
    0, 8, 1, 7, 0, 5, 6, 9, 3,
  ];

  let solution = [
    6, 5, 4, 8, 9, 1, 7, 3, 2,
    8, 7, 9, 3, 2, 5, 1, 6, 4,
    1, 3, 2, 6, 4, 7, 9, 5, 8,
    4, 1, 5, 7, 8, 3, 2, 6, 9,
    7, 9, 8, 4, 5, 6, 3, 2, 1,
    3, 2, 6, 9, 1, 8, 5, 4, 7,
    2, 4, 3, 5, 6, 9, 8, 1, 7,
    5, 6, 7, 1, 3, 2, 4, 8, 9,
    9, 8, 1, 2, 7, 4, 6, 7, 5,
  ];

  // Public - anyone can get clues (including guests)
  public query ({ caller }) func getClues() : async [Nat] {
    clues;
  };

  // Public - anyone can register (including guests)
  public shared ({ caller }) func registerParticipant(name : Text, sesaId : Text) : async () {
    if (participants.containsKey(sesaId)) {
      Runtime.trap("SESA ID already registered");
    };

    let participant : Participant = {
      name;
      sesaId;
      registeredAt = Time.now();
    };
    participants.add(sesaId, participant);
  };

  // Public query - anyone can check registration status
  public query ({ caller }) func isRegistered(sesaId : Text) : async Bool {
    participants.containsKey(sesaId);
  };

  // Public - anyone can submit (including guests)
  public shared ({ caller }) func submitPuzzle(sesaId : Text, boardState : [Nat], timeTakenSeconds : Nat) : async () {
    if (submissions.containsKey(sesaId)) {
      Runtime.trap("Submission already exists for this SESA ID");
    };

    if (boardState.size() != 81) {
      Runtime.trap("Invalid board state size");
    };

    let isCorrect = Array.tabulate(
      81,
      func(i) { boardState[i] == solution[i] }
    ).all(func(x) { x });

    let name = switch (participants.get(sesaId)) {
      case (?participant) { participant.name };
      case (null) { Runtime.trap("Participant not found") };
    };

    let submission : Submission = {
      sesaId;
      name;
      boardState;
      timeTakenSeconds;
      isCorrect;
      submittedAt = Time.now();
    };
    submissions.add(sesaId, submission);
  };

  // Public query - anyone can check submission status
  public query ({ caller }) func hasSubmitted(sesaId : Text) : async Bool {
    submissions.containsKey(sesaId);
  };

  // Admin-only - sensitive data containing all submissions
  public query ({ caller }) func getSubmissions() : async [Submission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all submissions");
    };
    submissions.values().toArray();
  };

  // Admin-only - sensitive data containing all participants
  public query ({ caller }) func getParticipants() : async [Participant] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all participants");
    };
    participants.values().toArray();
  };
};
